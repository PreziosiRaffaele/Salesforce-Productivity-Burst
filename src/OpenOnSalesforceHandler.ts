import * as vscode from 'vscode';
import * as path from 'path';
import { asyncQuery, isStandard, remove__c } from './Utils';
import { Connection } from './Connection';
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);

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
    vscode.window.showInformationMessage('It cannot be opened on Salesforce');
  }
}

async function openLink(){
  const openedFile = vscode.window.activeTextEditor;
  const pathParsed = path.parse(openedFile.document.fileName);
  const extension = pathParsed.base.substring(pathParsed.base.indexOf('.')+1);

  const metadata = new Factory().create(extension, pathParsed);
  const url = await metadata.getUrl();

  await execAsync(`sfdx force:org:open -u "${Connection.getConnection().getUsername()}" -p ${url}`);
}
class Factory{

  create = (extension, pathParsed) => {
    if(!extension || !pathParsed) {
        throw 'It cannot be opened';
    }
    let metadata;
    if(extension === 'flow-meta.xml'){
      metadata = new Flow(extension, pathParsed);
    }else if(extension === 'field-meta.xml'){
      metadata = new Field(extension, pathParsed);
    }else if(extension === 'validationRule-meta.xml'){
      metadata = new ValidationRule(extension, pathParsed);
    }else if(extension === 'flexipage-meta.xml'){
      metadata = new FlexiPage(extension, pathParsed);
    }else if(extension === 'profile-meta.xml'){
      metadata = new Profile(extension, pathParsed);
    }else if(extension === 'permissionset-meta.xml'){
      metadata = new PermissionSet(extension, pathParsed);
    }else if(extension === 'permissionsetgroup-meta.xml'){
      metadata = new PermissionSetGroup(extension, pathParsed);
    }else if(extension === 'cls'){
      metadata = new ApexClass(extension, pathParsed);
    }else if(extension === 'trigger'){
      metadata = new ApexTrigger(extension, pathParsed);
    }else if(extension === 'recordType-meta.xml'){
      metadata = new RecordType(extension, pathParsed);
    }else if(extension === 'layout-meta.xml'){
      metadata = new PageLayout(extension, pathParsed);
    }

    return metadata;
  }
}

class Metadata{
  extension;
  pathParsed;
  metadataApiName;
  constructor(extension, pathParsed){
    this.extension = extension;
    this.pathParsed = pathParsed;
    this.metadataApiName = pathParsed.base.substring(0, pathParsed.base.indexOf('.'));
  }

  getUrl(){}
}

class PageLayout extends Metadata{
  async getUrl(){
    const splitObjectNameLayoutName = this.metadataApiName.split('-');
    const objectName = splitObjectNameLayoutName[0];
    const layoutName = splitObjectNameLayoutName[1];
    const objectId = await Connection.getConnection().getObjectId(objectName);
    const queryResult = await asyncQuery(`SELECT Id FROM Layout WHERE Name = '${decodeURIComponent(layoutName)}'`);
    return `lightning/setup/ObjectManager/${objectId}/PageLayouts/${queryResult[0].Id}/view`
  }
}

class RecordType extends Metadata{
  async getUrl(){
    const queryResult = await asyncQuery(`SELECT Id FROM RecordType WHERE Name = '${this.metadataApiName}'`);
    const arrayPath = this.pathParsed.dir.split(path.sep);
    let objectFolderName = arrayPath[arrayPath.length - 2];
    const objectId = await Connection.getConnection().getObjectId(objectFolderName);
    return `lightning/setup/ObjectManager/${objectId}/RecordTypes/${queryResult[0].Id}/view`
  }
}

class Flow extends Metadata{
  async getUrl(){
    const queryResult = await asyncQuery(`SELECT LatestVersionId FROM FlowDefinition WHERE DeveloperName = '${this.metadataApiName}'`);
    return `builder_platform_interaction/flowBuilder.app?flowId=${queryResult[0].LatestVersionId}`
  }
}

class ValidationRule extends Metadata{
  async getUrl(){
    const queryResult = await asyncQuery(`SELECT Id,EntityDefinitionId FROM ValidationRule WHERE ValidationName = '${this.metadataApiName}'`);
    return `lightning/setup/ObjectManager/${queryResult[0].EntityDefinitionId}/ValidationRules/${queryResult[0].Id}/view`;
  }
}

class FlexiPage extends Metadata{
  async getUrl(){
    const queryResult = await asyncQuery(`SELECT Id FROM FlexiPage WHERE DeveloperName = '${this.metadataApiName}'`);
    return `visualEditor/appBuilder.app?id=${queryResult[0].Id}`
  }
}

class Profile extends Metadata{
  async getUrl(){
    const queryResult = await asyncQuery(`SELECT Id FROM Profile WHERE Name = '${this.metadataApiName}'`);
    return queryResult[0].Id
  }
}

class PermissionSet extends Metadata{
  async getUrl(){
    const queryResult = await asyncQuery(`SELECT Id FROM PermissionSet WHERE Name = '${this.metadataApiName}'`);
    return queryResult[0].Id
  }
}

class PermissionSetGroup extends Metadata{
  async getUrl(){
    const queryResult = await asyncQuery(`SELECT Id FROM PermissionSetGroup WHERE DeveloperName = '${this.metadataApiName}'`);
    return queryResult[0].Id
  }
}

class ApexClass extends Metadata{
  async getUrl(){
    const queryResult = await asyncQuery(`SELECT Id FROM ApexClass WHERE Name = '${this.metadataApiName}'`);
    return queryResult[0].Id
  }
}

class ApexTrigger extends Metadata{
  async getUrl(){
    const queryResult = await asyncQuery(`SELECT Id FROM ApexTrigger WHERE Name = '${this.metadataApiName}'`);
    return queryResult[0].Id
  }
}

class Field extends Metadata{
  async getUrl(){
    let url;

    const arrayPath = this.pathParsed.dir.split(path.sep);
    let objectFolderName = arrayPath[arrayPath.length - 2];
    if(isStandard(this.metadataApiName)){ //Per i campi e gli oggetti standard posso utilizzare come Id il developerName
      if(this.metadataApiName.slice(-2) === 'Id'){
        this.metadataApiName = this.metadataApiName.substring(0,this.metadataApiName.length-2);
      }
      url = `lightning/setup/ObjectManager/${objectFolderName}/FieldsAndRelationships/${this.metadataApiName}/view`;
    }else{
      this.metadataApiName = remove__c(this.metadataApiName);
      const objectId = await Connection.getConnection().getObjectId(objectFolderName);
      const queryResult = await asyncQuery(`SELECT Id FROM CustomField WHERE DeveloperName = '${this.metadataApiName}' AND TableEnumOrId = '${objectId}'`);
      url = `lightning/setup/ObjectManager/${objectId}/FieldsAndRelationships/${queryResult[0].Id}/view`
    }

    return url;
  }
}
