import xlsx from 'xlsx';
import * as R from 'ramda';

/**
 * Read the data model from a .xlsx
 * @param dataMdoelXLSX The path of the excel sheet
 * @returns The data model object @see {@link ../README.md}
 */
function readDataModelXLSX(dataModelXLSX) {
    // Okay, so lets fill in missing parts of the data table
    const rawDataModel = xlsx.readFile(dataModelXLSX, { raw: true });

    const projectName = readCell(rawDataModel, 'Project Overview', 'A2');
    const projectDesc = readCell(rawDataModel, 'Project Overview', 'A5');
    const projectCreator = readCell(rawDataModel, 'Project Overview', 'A8');

    const nodeURL = readCell(rawDataModel, 'Deployment Configuration', 'B5');
    const nodeLabel = readCell(rawDataModel, 'Deployment Configuration', 'B6');
    const openIdDiscoveryUrl = readCell(rawDataModel, 'Deployment Configuration', 'B7');
    const clientId = readCell(rawDataModel, 'Deployment Configuration', 'B8');
    const clientSecret = readCell(rawDataModel, 'Deployment Configuration', 'B9');

    const organizations = R.takeWhile(x => x, readColumn(rawDataModel, 'Organizations', 'A', 2, 200));

    const assetNames = readColumn(rawDataModel, 'Assets', 'A', 2, 200);
    const assetAttributes = readColumn(rawDataModel, 'Assets', 'B', 2, 200);
    const unitOfMeasures = readColumn(rawDataModel, 'Assets', 'C', 2, 200);
    const descriptions = readColumn(rawDataModel, 'Assets', 'D', 2, 200);
    const sampleValues = readColumn(rawDataModel, 'Assets', 'E', 2, 200);
    const assetAttributeTypes = readColumn(rawDataModel, 'Assets', 'F', 2, 200);
    const referenceTos = readColumn(rawDataModel, 'Assets', 'G', 2, 200);

    const lower = s => s.charAt(0).toLowerCase() + s.substr(1);

    // A list of all the attributes
    const attributes = zipToDict(
        'rawName', assetNames,
        'attribute', assetAttributes,
        'field', assetAttributes.map(a => a ? lower(a.trim().replace(/\W/g, '_')) : a),
        'unitOfMeasure', unitOfMeasures,
        'description', descriptions,
        'sampleValue', sampleValues,
        'type', assetAttributeTypes,
        'reference', referenceTos,
    );

    // Our data (ourData) is structured like the following
    /**
     [
        {
            name: 'Car',
            attribute: 'quantity',
            type: 'text',
            referenceTo: undefined
        },
        {
            name: 'Car',
            attribute: 'speed',
            type: 'text',
            referenceTo: undefined
        },
        {
            name: 'Car',
            attribute: 'color',
            type: 'text',
            referenceTo: undefined
        },
        ...
    ]
    */
    // Now we turn it into 
    /**
     [
        {
            name: "gathers",
            attributes: [
                {
                    name: "basin",
                    type: "text",           // is one of integer, text, boolean, reference, references
                },
                {
                    name: "survey",
                    type: "reference",      // is one of integer, text, boolean, reference, references
                    reference: "survey"     // only if type == reference or type == reference 
                },
            ],
        },
    ]
    */

    const groupByAsset = R.groupBy(entry => entry.rawName);

    const dissociateName = R.map(g => R.map(a => R.dissoc('rawName', a), g));

    const someMap = R.mapObjIndexed((val, key, obj) => (
        { 
            name: key ? key.trim().replace(/\W/g, '_') : key, 
            rawName: key,
            attributes: val 
        }
    ));

    const assets = R.values(someMap(dissociateName(groupByAsset(attributes))));

    // We need to do something really ugly. For each field we need a `referenceField` that is the
    // first `field` in whatever asset is being referenced. This will most commonly be a
    // unique_Something_ID
    const assetAndFirstAttribute = assets.map(a => [a.name, a.attributes[0].field]);
    // Dictionary containing all the assets and their first attributes
    const firstAttrLookup = R.fromPairs(assetAndFirstAttribute);
    // Add the referenceField to every attribute
    const assetsWithReferenceFields = R.map(asset => R.mergeDeepRight(asset, { attributes: R.map(attr => R.assoc('referenceField', firstAttrLookup[attr.reference], attr), asset.attributes) }), assets)

    return {
        name: projectName,
        description: projectDesc,
        creator: projectCreator,
        organizations: organizations,
        deploy: {
            docker: {
                orgName: organizations[0].trim().replace(/\W/g, '_').toLowerCase(),
                node: {
                    oauth: {
                        openIdDiscoveryUrl: openIdDiscoveryUrl,
                        clientId: clientId,
                        clientSecret: clientSecret,
                    },
                },
            },
            mercata: {
                orgName: organizations[0].trim().replace(/\W/g, '_').toLowerCase(),
                node: {
                    label: nodeLabel,
                    url: nodeURL,
                    oauth: {
                        openIdDiscoveryUrl: openIdDiscoveryUrl,
                        clientId: clientId,
                        clientSecret: clientSecret,
                    },
                },
            },
        },
        assets: assetsWithReferenceFields,
    }
}

function readColumn(spreadsheet, sheetName, columnName, start, end) {
    const sheet = spreadsheet.Sheets[sheetName];

    const range = R.range(start, end)                   // The range we search on
                    .map(i => sheet[columnName + i])    // Find the value of the cell
                    .map(cell => cell ? cell.v : cell); // Get the value of the cell ()

    return range;
}

function readCell(spreadsheet, sheetName, cell) {
    const res = spreadsheet.Sheets[sheetName][cell];
    return res ? res.v : res;
}

// zipToDict expects args of this form zipToDict(key1, list1, key2, list2, key3, list3...);
// And it will return [{k1:l1, k2:l2}, {k1:l2, k2:l2}, {k1:l3, k2:l3}...]
function zipToDict(...args) {
    if (args.length % 2 !== 0) {
        throw Error('zipToDict requires an even number of arguments');
    }

    const keyIndexes = R.range(0, args.length).filter(x => x % 2 === 0);
    const listIndexes = keyIndexes.map(x => x+1);

    const maxLength = Math.max(...(listIndexes.map(li => args[li].length)));

    const zippedList = 
        R.range(0, maxLength)           // List every possible index
            .map(i =>                   // For each index
                R.fromPairs(            // Form a dictionary from pair
                    keyIndexes.map(j => // The dictionary contains pairs of
                        [args[j], args[j+1][i]])))  // [key, value]

    // Remove the undefined rows
    const filteredZippedList =
        R.takeWhile(v => !R.all(R.equals(undefined), R.values(v)), zippedList)

    return filteredZippedList;
}

export default {
    readDataModelXLSX,
}
