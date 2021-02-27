
import { Stato } from './stato';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
import { getCurrentOrg, isInvalidFile, getCurrentClassName,highlightCoverage,cleanCoverage} from './Utils';
import * as vscode from 'vscode';
const REFRESH_DATA = 'Refresh Data';
const TOTAL_COVERAGE = 'Total Coverage';


export async function run(status : Stato) {

  const openedClass = vscode.window.activeTextEditor;
  if(!openedClass || isInvalidFile(openedClass)){
		vscode.window.showInformationMessage('Apex Class or Trigger not found');
		return;
	}

  cleanCoverage(openedClass);

  let className = getCurrentClassName(openedClass);
  let currentOrg = getCurrentOrg();

  if(!currentOrg){
    vscode.window.showInformationMessage('sfdx-config.json not found');
		return;
  }

  if(currentOrg != status.defaultOrg || !status.mapNameClass_MapMethodName_Coverage.has(className) || !status.userName){
    await vscode.window.withProgress(
      {
        title: 'Apex Get Coverage - ' + className,
        location: vscode.ProgressLocation.Notification
      },
      () => runAsync(status, currentOrg, className)
    );
  }

  if(!status.mapNameClass_MapMethodName_Coverage.has(className)){
    vscode.window.showInformationMessage('No Coverage found for this Class/Trigger. Run Test Class!');
    return;
  }

  let options = getOptions(status, className);

  vscode.window.showQuickPick(options).then(selection => {
    if (!selection) {
      return;
    }

    let selected = selection.split(' - ')[0].trim();

    if(selection == REFRESH_DATA){
      status.mapNameClass_MapMethodName_Coverage.delete(className);
      status.mapNameClass_TotalCoverage.delete(className);
      vscode.commands.executeCommand('extension.getCoverage');
    }else if(selected == TOTAL_COVERAGE){
      highlightCoverage(status.mapNameClass_TotalCoverage.get(className)[0].Coverage, openedClass);
    }else{
      highlightCoverage(status.mapNameClass_MapMethodName_Coverage.get(className).get(selected).Coverage, openedClass);
    }
  });
}

async function runAsync(status: Stato, currentOrg :String, className : String){
  if(currentOrg != status.defaultOrg || !status.userName){
    status = new Stato(currentOrg);
    let response = await exec('sfdx force:auth:list --json');
    let jsonResponse = JSON.parse(response.stdout);
    for(const accessOrg of jsonResponse.result){
      if(accessOrg.alias == currentOrg){
        status.userName = accessOrg.username;
        break;
      }
    }
  }

  let query = 'sfdx force:data:soql:query -q "Select ApexTestClass.Name,TestMethodName, NumLinesCovered, NumLinesUncovered, Coverage from ApexCodeCoverage where ApexClassOrTrigger.name = \'' + className + '\' order by createddate desc LIMIT 20" -t -u ' + '"' + status.userName + '" --json';

  let response = await exec(query);
  let records = JSON.parse(response.stdout)["result"].records;

  if(records.length > 0){
    let mapMethodName_Coverage = new Map();
    records.forEach(record => {
      mapMethodName_Coverage.set(record.ApexTestClass.Name + '.' + record.TestMethodName, record);
    });

    status.mapNameClass_MapMethodName_Coverage.set(className, mapMethodName_Coverage);

    query = 'sfdx force:data:soql:query -q "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage FROM ApexCodeCoverageAggregate WHERE ApexClassOrTrigger.Name = \'' + className + '\'" -t -u ' + '"' + status.userName + '" --json';
    response = await exec(query);
    records = JSON.parse(response.stdout)["result"].records;
    status.mapNameClass_TotalCoverage.set(className, records);
  }
}

function getOptions(status : Stato, className : String){
  let options = [REFRESH_DATA];
  let recordTotalCoverage = status.mapNameClass_TotalCoverage.get(className)[0];
  let methodCoverage = (recordTotalCoverage.NumLinesCovered / (recordTotalCoverage.NumLinesCovered + recordTotalCoverage.NumLinesUncovered)) * 100;
  options.push(TOTAL_COVERAGE + ' - ' + methodCoverage.toFixed(2) + '%');

  let mapMethodName_Coverage = status.mapNameClass_MapMethodName_Coverage.get(className);

  for (const entry of mapMethodName_Coverage.entries()) {
    let methodCoverage = (entry[1].NumLinesCovered / (entry[1].NumLinesCovered + entry[1].NumLinesUncovered)) * 100;
    options.push(entry[0] + ' - ' + methodCoverage.toFixed(2) + '%');
  }

  return options;
}