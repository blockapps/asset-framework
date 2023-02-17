import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import * as R from 'ramda';
import spawn from 'cross-spawn';

import readDataModelXLSX from './generation/dataModelXLSX';
import templateHelpers from './generation/templateHelpers';

/**
 * Run a cli tool
 */
let excelSheet = undefined;
let directory = undefined;
program
    .description('This utility instantiates a STRATO Asset application. It will create a project based off your provided <data-model> Excel file, and initialize the STRATO dapp.')
    .version(require('./package.json').version)
    .arguments('<dataModel>', 'The data model of the project, a XLSX file')
    .arguments('<directory>', 'The directory of the new project')
    .action(async (xl, dir) => { 
        excelSheet = xl;
        directory = dir;
    });

program.parse(process.argv);



/**
 * Parse the XLSX spreadsheet into JSON
 */
const dataModel = readDataModelXLSX.readDataModelXLSX(excelSheet);

// Add the directory
dataModel['directory'] = 
    path.normalize(
        path.isAbsolute(directory)
            ? directory 
            : path.join(process.cwd(), directory)); 

// Add deploy options. Merge the ones already in dataModel.deploy from
// the spreadsheet with the ones we are specifying below.
dataModel['deploy'] = R.mergeDeepLeft(dataModel.deploy, {
    docker: {
        apiDebug: true,
        deployFilename: 'config/docker.deploy.yaml',
        node: {
            url: 'http://nginx:80',
            oauth: {
                appTokenCookieName: 'asset_framework_session',
                scope: 'email openid',
                redirectUri: 'http://localhost/api/v1/authentication/callback',
                logoutRedirectUri: 'http://localhost'
            
            }
        }
    },
    mercata: {
        apiDebug: true,
        configDirPath: './config',
        deployFilename: 'localhost.deploy.yaml',
        orgDeployFilename: 'org.deploy.yaml',
        bootMembersFilename: 'boot_members.yaml',
        node: {
            url: 'http://localhost:8080',
            oauth: {
                appTokenCookieName: 'asset_framework_session',
                scope: 'email openid',
                redirectUri: 'http://localhost/api/v1/authentication/callback',
                logoutRedirectUri: 'http://localhost'
            
            }
        }
    }
});

/**
 * Generate the project
 * 1. Copy files over
 * 2. Copy templates over
 * 3. git init
 * 4. Initialize yarn etc.
 */
console.log(`\n\nWelcome to the STRATO asset-framework utility.`);
console.log(`This tool will generate a basic project for an asset-based application built on STRATO,`);
console.log(`including a React UI and a NodeJS server, integrated with Blockapps-Rest SDK.`);


console.log(`\nGenerating an app in ${directory} using the data model from ${excelSheet}`)
console.log(`Checking directory ${dataModel.directory}...`);
fs.ensureDirSync(dataModel.directory);

/** 
 * 1. Copy files over
 */
const assetTemplates = [
    './backend/api/v1/{{name}}/index.hbs.js',
    './backend/api/v1/{{name}}/{{lower name}}.controller.hbs.js',
    './backend/dapp/assets/{{name}}/contracts/{{name}}.hbs.sol',
    './backend/dapp/assets/{{name}}/test/{{lower name}}.factory.hbs.js',
    './backend/dapp/assets/{{name}}/test/{{lower name}}.test.hbs.js',
    './backend/dapp/assets/{{name}}/{{lower name}}.hbs.js',
    './backend/dapp/assets/{{name}}/{{lower name}}Chain.hbs.js',
    './ui/src/contexts/{{lower name}}/actions.hbs.js',
    './ui/src/contexts/{{lower name}}/index.hbs.js',
    './ui/src/contexts/{{lower name}}/reducer.hbs.js',
    './ui/src/components/{{name}}/{{name}}Details.hbs.js',
    './ui/src/components/{{name}}/index.hbs.js',
    './ui/src/components/{{name}}/CreateModal.hbs.js',
    './ui/src/components/{{name}}/TransferOwnershipModal.hbs.js',
    './ui/src/components/{{name}}/UpdateModal.hbs.js',
    './ui/src/components/{{name}}/ImportCSVModal.hbs.js',
    './backend/test/v1/{{lower name}}.test.hbs.js',
    './backend/test/v1/factories/{{lower name}}.hbs.js',
    './backend/api/v1/{{name}}/{{lower name}}.hbs.yaml'
];
const refTemplates = [
    './backend/dapp/assets/{{name}}/contracts/{{name}}_{{reference}}_Ref.hbs.sol',
    './backend/dapp/assets/{{name}}/test/{{lower name}}_{{reference}}_Ref.factory.hbs.js',
    './backend/dapp/assets/{{name}}/test/{{lower name}}_{{reference}}_Ref.test.hbs.js',
    './backend/dapp/assets/{{name}}/{{lower name}}_{{reference}}_Ref.hbs.js',
];

// Dispatch file copying depending on the type of template a file is
const copyFile = file => {
    if (R.includes(file, assetTemplates)) {
        const filePathTemplate = templateHelpers.drop_hbs_extension(file);
        const fileTemplate = fs.readFileSync(path.join(`${__dirname}`, 'template', file), 'utf-8');

        const filePaths = templateHelpers.multiAssetTemplate(dataModel, filePathTemplate);
        const files = templateHelpers.multiAssetTemplate(dataModel, fileTemplate);

        const filePathAndFiles = R.zip(filePaths, files);

        filePathAndFiles.forEach(([fp, f]) => {
            fs.outputFileSync(path.join(dataModel.directory, fp), f);
        });
    } else if (R.includes(file, refTemplates)) {
        const filePathTemplate = templateHelpers.drop_hbs_extension(file);
        const fileTemplate = fs.readFileSync(path.join(`${__dirname}`, 'template', file), 'utf-8');

        const filePaths = templateHelpers.multiRefTemplate(dataModel, filePathTemplate);
        const files = templateHelpers.multiRefTemplate(dataModel, fileTemplate);

        const filePathAndFiles = R.zip(filePaths, files);

        filePathAndFiles.forEach(([fp, f]) => {
            fs.outputFileSync(path.join(dataModel.directory, fp), f);
        });
    } else if (R.test(/.hbs/, file)) {
        const filePath = templateHelpers.drop_hbs_extension(file);
        const template = fs.readFileSync(path.join(`${__dirname}`, 'template', file), 'utf-8');

        const content = templateHelpers.simpleTemplate(dataModel, template);
        fs.outputFileSync(path.join(dataModel.directory, filePath), content);
    } else {
        fs.copySync(path.join(`${__dirname}`, 'template', file), path.join(dataModel.directory, file));
    }
}


// Get all the files within the template directory
console.log('Copying all the files from the template folder')
process.chdir(`${__dirname}/template`);
const allFiles = templateHelpers.getAllFiles(`.`);
process.chdir(`${__dirname}`);

// Copy all the files over
allFiles.forEach(file => copyFile(file));

// Stop here if you are only templating. Otherwise go on to initialize the directory
// This is useful if you don't want to wait around for initialization.
if (process.env.TEMPLATE_ONLY) {
    console.log('Finished copying templates. Generated', dataModel.directory);
    process.exit();
}



// Set up Git
console.log(`Setting up your application. This might take a few minutes:`);
console.log(`\tChecking git status...`);
process.chdir(`${dataModel.directory}`);
const gitResult = spawn.sync("git", ["status"]);
if (gitResult.status !== 0) {
  console.log(`\t\tInitializing git...`);
  spawn.sync("git", ["init"]);
}



// --------------------------------------------------------------------------------
// ------------ the following section installs all dependencies -------------------
// --------------------------------------------------------------------------------


// Set up the server (backend directory)
console.log(`\tSetting up server`);
console.log(`\t\tInitializing server package.json...`);
process.chdir(`${dataModel.directory}/backend`);
spawn.sync("yarn", ["init", "-yp"]);

console.log(`\t\tInstalling server node modules...`);
spawn.sync("yarn", ["add", "blockapps-rest@8.1.0"]); // TODO: fix rest.response.status so we can use latest
spawn.sync("yarn", ["add", "@hapi/joi"]);
spawn.sync("yarn", ["add", "cookie-parser"]);
spawn.sync("yarn", ["add", "express"]);
spawn.sync("yarn", ["add", "helmet"]);
spawn.sync("yarn", ["add", "http-status-codes"]);
spawn.sync("yarn", ["add", "body-parser"]);
spawn.sync("yarn", ["add", "winston"]);
spawn.sync("yarn", ["add", "express-winston"]);
spawn.sync("yarn", ["add", "dayjs"]);
spawn.sync("yarn", ["add", "chai"]);
spawn.sync("yarn", ["add", "chai-http"]);
spawn.sync("yarn", ["add", "clui"]);
spawn.sync("yarn", ["add", "dotenv"]);
spawn.sync("yarn", ["add", "mocha"]);
spawn.sync("yarn", ["add", "cors"]);
spawn.sync("yarn", ["add", "jwt-decode"]);
spawn.sync("yarn", ["add", "ramda"]);
spawn.sync("yarn", ["add", "babel-plugin-module-resolver@4.1.0"]);
spawn.sync("yarn", ["add", "is-subset"]);
spawn.sync("yarn", ["add", "swagger-jsdoc"]);
spawn.sync("yarn", ["add", "swagger-ui-express"]);
spawn.sync("yarn", ["add", "--dev", "@babel/core"]);
spawn.sync("yarn", ["add", "--dev", "@babel/cli"]);
spawn.sync("yarn", ["add", "--dev", "@babel/node"]);
spawn.sync("yarn", ["add", "--dev", "@babel/preset-env"]);
spawn.sync("yarn", ["add", "--dev", "@babel/register"]);
spawn.sync("yarn", ["add", "--dev", "@babel/polyfill"]);


// Set UI up
console.log(`\tSetting up UI`);
console.log(`\t\tInitializing ui package.json...`);
process.chdir(`${dataModel.directory}/ui`);
spawn.sync("yarn", ["init", "-yp"]);

console.log(`\t\tInstalling ui node modules...`);
spawn.sync("yarn", ["add", "antd"]);
spawn.sync("yarn", ["add", "@ant-design/icons"]);
spawn.sync("yarn", ["add", "@ant-design/pro-layout"]);
spawn.sync("yarn", ["add", "@testing-library/jest-dom"]);
spawn.sync("yarn", ["add", "@testing-library/react"]);
spawn.sync("yarn", ["add", "@testing-library/user-event"]);
spawn.sync("yarn", ["add", "http-status-codes"]);
spawn.sync("yarn", ["add", "dayjs"]);
spawn.sync("yarn", ["add", "prop-types"]);
spawn.sync("yarn", ["add", "react"]);
spawn.sync("yarn", ["add", "react-dom"]);
spawn.sync("yarn", ["add", "react-router-dom"]);
spawn.sync("yarn", ["add", "react-scripts"]);
spawn.sync("yarn", ["add", "styled-components"]);
spawn.sync("yarn", ["add", "web-vitals"]);
spawn.sync("yarn", ["add", "react-papaparse"]);


// Selenium
console.log(`\tSetting up selenium`);
console.log(`\t\tInitializing selenium package.json...`);
process.chdir(`${dataModel.directory}/selenium`);
spawn.sync("yarn", ["init", "-yp"]);

console.log(`\t\tInstalling selenium node modules...`);
spawn.sync("yarn", ["add", "mocha"]);
spawn.sync("yarn", ["add", "chai"]);
spawn.sync("yarn", ["add", "selenium-webdriver"]);
spawn.sync("yarn", ["add", "--dev", "@babel/core"]);
spawn.sync("yarn", ["add", "--dev", "@babel/preset-env"]);
spawn.sync("yarn", ["add", "--dev", "@babel/register"]);




// -----------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------

console.log(`Done\n`);
console.log(`Enter the ${dataModel.directory} directory and check README.md to get started`);
console.log("Happy building!");
