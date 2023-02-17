# The Asset-Framework

## Introduction
The Asset Framework is a tool designed to help kickstart the development of asset-tracking based apps on the STRATO Mercata network.

For more information on STRATO Mercata, please visit: [https://blockapps.net/products/strato-mercata/](https://blockapps.net/products/strato-mercata/)

For STRATO Developer Documentation, please visit: [https://docs.blockapps.net/](https://docs.blockapps.net/)

### Development Requirement
In order to develop apps on Mercata, you must have a STRATO Mercata account. Sign up for one here: [https://login.blockapps.net/](https://login.blockapps.net/)
## Description
The Asset-Framework allows for faster deployment of Dapps on STRATO Mercata and provides an easy and simple skeleton project. It allows a developer or business user to input an asset data model into a .XLSX spreadsheet and easily create a working skeleton project. This skeleton project can then be altered by the developer to better suit the application's needs. 

Out of the box, the Asset Framework includes (but is not limited to) the following features:

- Deployment of your Dapp to a Private Dapp Realm
- Assets represented as Private Asset Shards
- User ownership and transfer Assets
- Basic JS Express API for basic Asset CRU methods
- React UI to display and enable basic Asset CRU flows
- Deployment of entire Dapp in Docker
- Reference Smart Contracts for common application development patterns, such as User Membership and Permissioning

## Generating your Project
To run the Asset Framework tool, several things are needed.

1. Node JS
2. Yarn 🐈
3. Strato Mercata membership and accessible node
4. A completed Asset Framework Data Model spreadsheet describing the application's asset data model.
5. Docker

Yarn must be installed for this project to work. Yarn will handle many aspects and allow the project to be built, please reference the [Yarn installation guide](https://classic.yarnpkg.com/lang/en/docs/install/) for more information on how to install.

The Asset Framework Data Model blank spreadsheet can be found [in the top level of the Asset Framework directory](./Blank_Asset-Framework_Spreadsheet.xlsx).

There is also an [example spreadsheet](./test-data-model.xlsx) available to help guide users through the filling in their spreadsheet. 

Please follow the following steps to get your app up and running quickly:

1. Download the Asset Framework repository from Github

From a command line:

```git clone git@github.com:blockapps/asset-framework.git```

Alternatively the repository can be downloaded manually by clicking the top right "Code" button on the Asset Framework Github Repository homepage, and selecting "Download Zip" and following the prompts.

2. Install Dependencies

From a command line, navigate to the downloaded `asset-framework` directory.

Run `yarn install` to install the dependencies for the asset framework to generate your project.
      
3. Edit the Data Model spreadsheet to fit your app's requirements or copy an existing data model into the asset-framework directory

4. Setup Mercata login credentials for your app

Create a new `.env` file in the `backend/` directory with the following values:

```
GLOBAL_ADMIN_NAME=<your-mercata-username>
GLOBAL_ADMIN_PASSWORD=<your-mercata-password>
```

5. Generate your app

From the command line:

```yarn generate <data-model.xlsx> <target/directory>```

The expected runtime to fully generate your project is ~90-120 seconds.

Reference:

- `<data-model>.xlsx` 
  - The name of your Data Model spreadsheet file located in the Asset Framework directory
  - Example: `data-model.xlsx`
- `<target/directory>`
  - The directory where the generated project will be created, relative to the Asset Framework directory
  - Example: `../my-app`


6. Deploy your App to Mercata

At this point, your application will be able to be deployed to the Mercata network.

From the command line, navigate to the target directory of the generated project.

Run `yarn deploy`. This will create the Private Dapp Realm for your Dapp on the Mercata Node configured in the Data Model spreadsheet.

7. Start your App (development method)

To use and view the application, you must start the necessary programs to make their services accessible.

Navigate to the `nginx-docker` directory of your new project and run:

Linux:
```
HOST_IP=172.17.0.1 docker-compose up -d
```

Mac OS:
```
HOST_IP=docker.for.mac.localhost docker-compose up -d
```

Navigate to the `backend` directory of your new project and run:

```yarn start```

Keeping the current command line window open, create a new one.

In the new window, navigate to the project's `ui` directory and run the following command:

```yarn develop```

View the application at: https://localhost and sign-in with your Mercata account.

<details><summary>Additional Commands</summary>
<ul>

1. ```yarn example <target/directory>```: given a directory, this will generate an example project included with the Asset Framework. This is mostly to see what and where the files for a given example project will look like.
   
2. ```yarn template <filled-in-spreadsheet.xlsx> <target/directory>```: This will only generate the project source code, but will not install the project's dependencies. Most useful for development purposes. Note this command does not generate a `package.json` file.

3. ```yarn read-xlsx <filled-in-spreadsheet.xlsx>```: this will generate the JS object that is used in the generation of the project from the data model spreadsheet. This is useful for development purposes so you can be sure the framework is interpreting your data model correctly.
   
</ul>
</details>


## Data Model Spreadsheet

The Asset Framework uses a spreadsheet to define the project's assets and configuration. See each section below to understands what each section of the sheet does.

### Assets

This sheet defines the names, data fields, and possible relationships between the assets in your application.

Begin by listing out each asset *type* in your application - such as a "Product" and a "Machine". These will be the values in the first column, "Asset Name".

For each data field that an asset has, enter its name in a new row in the second column, "Asset Attribute". Match the asset attribute name with the corresponding asset type.

Next, define what type of data this attribute represents - a number, text, etc. Use the dropdown selection in the "Asset Attribute Type" to fill in this value. For "reference" types, this means that the attribute represents a foreign reference to another asset in the application. So enter the name of the referenced asset in the column to the right, "Reference to (for reference(s))". The "Reference to" column can be left blank for all non-reference type attributes.

Finally the remaining three columns - "Unit of Measure", "Description", and "Sample Value" are used entirely as utility columns to help you build out your data model. If you are unsure of what type your asset's attribute is, than enter in the data you know in these fields and think - "Which of the 6 data types matches this sample value"? These fields are useful to fill out to collaborate with other members of your team to develop the asset data model.

Note that the Framework already creates some default data fields on every asset, so those attributes should not be included in the data model:

- appChainId
- owner
- ownerOrganization
- ownerOrganizationalUnit
- ownerCommonName

### Project Overview

On the "Project Overview" sheet, there are three fields:

- Project Name
  - This is the name given to the overall project. Primarily used in the generated UI and internal configuration files to identify the project.
- Project Description
  - A brief description to give your project for its internal files.
- Project Creator
  - The author/name of the person/organization creating the project. Used to identify the project with its creator in internal files.

### Deployment Configuration

The deployment configuration should only be updated if you are a developer or technical user.

Below is an explanation of each value:

- openid_discovery_url
    - The OAuth Provider configured with the Mercate Node you are connecting to, as well the OAuth provider to use when signing into the application
- client_id
    - A client ID in your OAuth provider realm to use for communicating with Mercata purely from the backend server
- client_secret
    - The secret associated with the client ID

### Data Model JSON Representation

The Asset Framework converts the data model sheet into a JavaScript object that is referenced for the generation of your application.

Below is the format of that object:

<details>
<summary>Data Model Object Format</summary>

```
{
  name: 'Planetarium',
  description: 'Track the Ownership of planets',
  creator: 'BlockApps',
  organizations: [ 'Space UN', 'Interspace Government', 'United Moon Fronts' ],
  assets: [
    {
      name: 'Planet',
      attributes: [
        {
          attribute: 'Unique Planet ID',
          field: 'unique_Planet_ID',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'text',
          reference: undefined
        },
        {
          attribute: 'Planet Name',
          field: 'planet_Name',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'text',
          reference: undefined
        },
        {
          attribute: 'Planet Attributes',
          field: 'planet_Attributes',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'text',
          reference: undefined
        },
        {
          attribute: 'Acquisition Start Date',
          field: 'acquisition_Start_Date',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'integer',
          reference: undefined
        },
        {
          attribute: 'Acquisition End Date',
          field: 'acquisition_End_Date',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'integer',
          reference: undefined
        }
      ]
    },
    {
      name: 'Biome',
      attributes: [
        {
          attribute: 'Biome',
          field: 'biome',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'reference',
          reference: 'Planet'
        },
        {
          attribute: 'Unique Biome ID',
          field: 'unique_Biome_ID',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'text',
          reference: undefined
        },
        {
          attribute: 'Name',
          field: 'name',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'text',
          reference: undefined
        },
        {
          attribute: 'Date discovered',
          field: 'date_discovered',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'integer',
          reference: undefined
        }
      ]
    },
    {
      name: 'Life',
      attributes: [
        {
          attribute: 'Unique Lifeform ID',
          field: 'unique_Lifeform_ID',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'text',
          reference: undefined
        },
        {
          attribute: 'Lifeform common name',
          field: 'lifeform_common_name',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'text',
          reference: undefined
        },
        {
          attribute: 'Date Discovered',
          field: 'date_Discovered',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'integer',
          reference: undefined
        },
        {
          attribute: 'Sustaining Biomes',
          field: 'sustaining_Biomes',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'references',
          reference: 'Biome'
        }
      ]
    }
  ]
}
```

</details>

We also reformulate into two more kinds of things for assets and references.

For assets we can just choose the asset based on the index. For example it would look like just
by doing dataModel.assets[0].
```
{
  name: 'Planet',
      attributes: [
        {
          attribute: 'Unique Planet ID',
          field: 'unique_Planet_ID',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'text',
          reference: undefined,
          referenceField: undefined
        },
        {
          attribute: 'Planet Name',
          field: 'planet_Name',
          unitOfMeasure: undefined,
          description: undefined,
          sampleValue: undefined,
          type: 'text',
          reference: undefined,
          referenceField: undefined
        }
    ]
}
```

When we create contracts based on references, we reformulate the data model into
```
{
  name: "Life Form",
  reference: "Biome"
}
```
