import * as vscode from 'vscode';
import * as path from 'path';
import { Connection } from './Connection';
import { asyncQuery } from './Utils';

var urlMapping = {
  "flow-meta.xml" : {
    query : 'SELECT LatestVersionId FROM FlowDefinition WHERE DeveloperName  = ',
    url : (queryResult) => `builder_platform_interaction/flowBuilder.app?flowId=${queryResult.LatestVersionId}`
  },
  "field-meta.xml" : {
    query: 'SELECT Id,TableEnumOrId FROM customfield where DeveloperName =',
    url : (queryResult) => `lightning/setup/ObjectManager/${queryResult.TableEnumOrId}/FieldsAndRelationships/${queryResult.Id}/view`
  }
}

export async function openOnSaleforce(){
  try{
    const link = await vscode.window.withProgress(
      {
        title: 'RP: Open On Salesforce',
        location: vscode.ProgressLocation.Notification
      },
      () => getLink()
    );
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(link))
  }catch(error){
    console.log(error)
    vscode.window.showInformationMessage('You Cannot Open this on Saleforce');
  }
}

async function getLink(){
  const instanceUrl = Connection.getConnection().getInstanceUrl();
  const openedClass = vscode.window.activeTextEditor;
  const pathParsed = path.parse(openedClass.document.fileName);
  const extension = pathParsed.base.substring(pathParsed.base.indexOf('.')+1);
  const objectApiName = pathParsed.base.substring(0, pathParsed.base.indexOf('.'));
  const objectRecord = await asyncQuery(`${urlMapping[extension].query} '${objectApiName}'`);

  const url = urlMapping[extension].url(objectRecord[0])

  return instanceUrl + '/' + url;
}