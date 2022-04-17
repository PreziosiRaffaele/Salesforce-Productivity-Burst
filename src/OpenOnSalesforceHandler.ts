import * as vscode from 'vscode';
import * as path from 'path';
import { asyncQuery } from './Utils';
import { Connection } from './Connection';
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);

var urlMapping = {
  "flow-meta.xml" : {
    query: (developerName) => `SELECT LatestVersionId FROM FlowDefinition WHERE DeveloperName = '${developerName}'`,
    url : (queryResult) => `builder_platform_interaction/flowBuilder.app?flowId=${queryResult.LatestVersionId}`
  },
  "field-meta.xml" : {
    query: (fieldApiName, objectId) => `SELECT Id,TableEnumOrId FROM CustomField WHERE DeveloperName = '${fieldApiName}' AND TableEnumOrId = '${objectId}'`,
    url : (queryResult) => `lightning/setup/ObjectManager/${queryResult.TableEnumOrId}/FieldsAndRelationships/${queryResult.Id}/view`
  },
  "validationRule-meta.xml" : {
    query: (validationName) => `SELECT Id,EntityDefinitionId FROM ValidationRule WHERE ValidationName = '${validationName}'`,
    url : (queryResult) => `lightning/setup/ObjectManager/${queryResult.EntityDefinitionId}/ValidationRules/${queryResult.Id}/view`
  },
  "flexipage-meta.xml" : {
    query: (developerName) => `SELECT Id FROM FlexiPage WHERE DeveloperName = '${developerName}'`,
    url : (queryResult) => `https://vestas--leapup6.lightning.force.com/visualEditor/appBuilder.app?id=${queryResult.Id}`
  },
  "profile-meta.xml" : {
    query: (name) => `SELECT Id FROM Profile WHERE Name = '${name}'`,
    url : (queryResult) => queryResult.Id
  },
  "permissionset-meta.xml" : {
    query: (name) => `SELECT Id FROM PermissionSet WHERE Name = '${name}'`,
    url : (queryResult) => queryResult.Id
  },
  "permissionsetgroup-meta.xml" : {
    query: (developerName) => `SELECT Id FROM PermissionSetGroup WHERE DeveloperName = '${developerName}'`,
    url : (queryResult) => queryResult.Id
  },
  "cls" : {
    query: (name) => `SELECT Id FROM ApexClass WHERE Name = '${name}'`,
    url : (queryResult) => queryResult.Id
  },
  "trigger" : {
    query: (name) => `SELECT Id FROM ApexTrigger WHERE Name = '${name}'`,
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
  const arrayPath = pathParsed.dir.split(path.sep);
  const extension = pathParsed.base.substring(pathParsed.base.indexOf('.')+1);
  let metadataApiName = pathParsed.base.substring(0, pathParsed.base.indexOf('.'));
  let objectId;
  let url;
  if(extension === 'field-meta.xml'){
    let objectName = arrayPath[arrayPath.length - 2];
    if(isStandard(metadataApiName)){
      if(metadataApiName.slice(-2) === 'Id'){
        metadataApiName = metadataApiName.substring(0,metadataApiName.length-2);
      }
      url = `lightning/setup/ObjectManager/${objectName}/FieldsAndRelationships/${metadataApiName}/view`;
    }else{
      metadataApiName = getDeveloperName(metadataApiName);
      objectId = await getObjectId(objectName);
      const objectRecord = await asyncQuery(urlMapping[extension].query(metadataApiName, objectId));
      url = urlMapping[extension].url(objectRecord[0])
    }
  }else{
    const objectRecord = await asyncQuery(urlMapping[extension].query(metadataApiName));
    url = urlMapping[extension].url(objectRecord[0])
  }
  await execAsync(`sfdx force:org:open -u "${Connection.getConnection().getUsername()}" -p ${url}`);
}

async function getObjectId(objectName){
  if(isStandard(objectName)){
    return objectName;
  }else{
    const result = await asyncQuery(`Select Id from CustomObject WHERE DeveloperName = '${getDeveloperName(objectName)}'`)
    return result[0].Id;
  }
}

function isStandard(apiName){
  return !(apiName.slice(-3) === '__c');
}

function getDeveloperName(name){
  if(name.slice(-3) === '__c'){
    name = name.substring(0,name.length-3);
  }
  return name;
}