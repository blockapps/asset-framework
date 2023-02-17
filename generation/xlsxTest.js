import dataModelXLSX from './dataModelXLSX';
import util from 'util';

if (!process.argv[2]) {
    console.log('You need to specify a spreadsheet to read!');
    process.exit(1);
}

const dataModel = dataModelXLSX.readDataModelXLSX(process.argv[2]);

console.log(util.inspect(dataModel, {showHidden: false, depth: null, colors: true}));
