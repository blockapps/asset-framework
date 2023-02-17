import * as R from 'ramda';
import fs from 'fs-extra';
import handlebars from 'handlebars';

// Register our various handlebars helpers
handlebars.registerHelper('loud', function (aString) {
    return aString.toUpperCase();
});
handlebars.registerHelper('lower', s => {
    return s.charAt(0).toLowerCase() + s.substr(1);
});
handlebars.registerHelper('snake_case', s => {
    return s.trim().replace(/\W/g, '_').toLowerCase();
});
handlebars.registerHelper('solidityType', type => {
    let map = {};
    map['integer'] = 'int';
    map['datetime'] = 'int';
    map['text'] = 'string';
    map['boolean'] = 'bool';
    map['reference'] = 'string'; // chainId
    map['references'] = 'string'; // chainId
    return map[type];
});
handlebars.registerHelper('uiType', type => {
    let map = {};
    map['integer'] = 'number';
    map['datetime'] = 'DateType';
    map['text'] = 'text';
    map['boolean'] = 'text';
    map['reference'] = 'text';
    map['references'] = 'text';
    return map[type];
});
handlebars.registerHelper("ifeq", function(a, b, options) {
    if (a === b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
handlebars.registerHelper("ifneq", function(a, b, options) {
    if (a !== b) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
handlebars.registerHelper("eachrev", function(context, options) {
    var ret = "";
  
    for (var i = 0, j = context.length; i < j; i++) {
      ret = options.fn(context[i]) + ret;
    }
  
    return ret;
});


// A simple copy function that does zero templating
function copy(dataModel, text) {
    return text;
}

// A function that does basic templating
function simpleTemplate(dataModel, text) {
    return (handlebars.compile(text))(dataModel);
}

// A function that returns templated text for each asset
function multiAssetTemplate(dataModel, text) {
    return dataModel.assets.map(a => {
        return (handlebars.compile(text))(a);
    });
}

// A function that return templated text for each reference
function multiRefTemplate(dataModel, text) {
    // First, we must generate a list like this named `refs`
    // [{ name: "Volume", reference: "AssetName" }, ...]
    const refs = dataModel.assets.map(asset => {
        return asset.attributes.map(attribute => {
            if (attribute.type === 'references') {
                return [{
                    name: asset.name,
                    reference: attribute.reference,
                }];
            } else {
                return [];
            }
        })
    })

    const flattenedRefs = R.flatten(refs);

    return flattenedRefs.map(r => (handlebars.compile(text))(r));
}

// Converts `hello/hey.hbs.sol` into `hello/hey.sol`
function drop_hbs_extension(path) {
    const destructedPath = path.match(/(.*).hbs(.*)/);
    return destructedPath[1] + destructedPath[2];
}

// Return every file within a directory as a list
function getAllFiles(dir) {
    const helper = (dir, acc) => {
        const contents = fs.readdirSync(dir);
        contents.forEach(file => {
            if (fs.statSync(dir+'/'+file).isDirectory()) {
                acc = acc.concat(getAllFiles(dir+'/'+file));
            } else {
                acc.push(dir+'/'+file);
            }
        });
        return acc;
    };

    return helper(dir, []);
}


export default {
    copy,
    simpleTemplate,
    multiAssetTemplate,
    multiRefTemplate,
    drop_hbs_extension,
    getAllFiles
}
