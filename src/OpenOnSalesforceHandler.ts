import * as vscode from 'vscode';
import * as path from 'path';
import { asyncQuery } from './Utils';
import { Connection } from './Connection';
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);

const OPEN_ORG_COMMAND = `sfdx force:org:open -u "${Connection.getConnection().getUsername()}" -p `;

var urlMapping = {
  "flow-meta.xml" : {
    query : 'SELECT LatestVersionId FROM FlowDefinition WHERE DeveloperName  = ',
    url : (queryResult) => `builder_platform_interaction/flowBuilder.app?flowId=${queryResult.LatestVersionId}`
  },
  "field-meta.xml" : {
    query: 'SELECT Id,TableEnumOrId FROM customfield WHERE DeveloperName =',
    url : (queryResult) => `lightning/setup/ObjectManager/${queryResult.TableEnumOrId}/FieldsAndRelationships/${queryResult.Id}/view`
  },
  "validationRule-meta.xml" : {
    query: 'SELECT Id,EntityDefinitionId FROM ValidationRule WHERE ValidationName =',
    url : (queryResult) => `lightning/setup/ObjectManager/${queryResult.EntityDefinitionId}/ValidationRules/${queryResult.Id}/view`
  },
  "flexipage-meta.xml" : {
    query: 'SELECT Id FROM FlexiPage WHERE DeveloperName =',
    url : (queryResult) => `https://vestas--leapup6.lightning.force.com/visualEditor/appBuilder.app?id=${queryResult.Id}`
  },
  "profile-meta.xml" : {
    query: 'SELECT Id FROM Profile WHERE Name =',
    url : (queryResult) => queryResult.Id
  },
  "permissionset-meta.xml" : {
    query: 'SELECT Id FROM PermissionSet WHERE Name =',
    url : (queryResult) => queryResult.Id
  },
  "permissionsetgroup-meta.xml" : {
    query: 'SELECT Id FROM PermissionSetGroup WHERE DeveloperName =',
    url : (queryResult) => queryResult.Id
  },
  "cls" : {
    query: 'SELECT Id FROM ApexClass WHERE Name =',
    url : (queryResult) => queryResult.Id
  },
  "trigger" : {
    query: 'SELECT Id FROM ApexTrigger WHERE Name =',
    url : (queryResult) => queryResult.Id
  }
}

export async function openOnSaleforce(){
  try{
    const link = await vscode.window.withProgress(
      {
        title: 'SPB: Open On Salesforce',
        location: vscode.ProgressLocation.Notification
      },
      () => openLink()
    );
  }catch(error){
    console.log(error)
    vscode.window.showInformationMessage('It cannot be opened');
  }
}

async function openLink(){
  const openedClass = vscode.window.activeTextEditor;
  const pathParsed = path.parse(openedClass.document.fileName);
  const extension = pathParsed.base.substring(pathParsed.base.indexOf('.')+1);
  const objectApiName = pathParsed.base.substring(0, pathParsed.base.indexOf('.'));
  const objectRecord = await asyncQuery(`${urlMapping[extension].query} '${objectApiName}'`);

  const url = urlMapping[extension].url(objectRecord[0])
  await execAsync(OPEN_ORG_COMMAND + url);
}