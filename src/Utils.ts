const fs = require('fs')
const execSync = require('child_process').execSync;
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);
const writeFile = util.promisify(fs.writeFile);
import * as path from 'path';
import * as vscode from 'vscode';
import {getDecorationForCoveredLines, getDecorationForUncoveredLines} from './Decorations';
import { Connection } from './Connection';
let decorationTypeCoveredLine;
let decorationTypeUncoveredLine;

/**
 * @returns the opened Class Name
 */
export function getCurrentClassName(){
  const openedClass = vscode.window.activeTextEditor;
  if(!openedClass || isInvalidFile(openedClass)){
    throw 'Apex Class/Trigger not opened!';
	}
  const pathClass = openedClass.document.fileName;
  return pathClass.substring(pathClass.lastIndexOf("\\")+1,pathClass.lastIndexOf("."));
}

/**
 * @returns if the opened File is an Apex Class
 */
export function isInvalidFile(openedClass) : Boolean{
  const pathClass = openedClass.document.fileName;
	let extension = pathClass.substring(pathClass.lastIndexOf("."));
	let validExtensions = new Set();
	validExtensions.add('.cls');
	validExtensions.add('.trigger');
	if(!pathClass || !validExtensions.has(extension)){
		return true;
	}else{
		return false;
  }
}

/**
 * @returns The array of VsCode.range
 */
function getRange(lines) : Array<vscode.Range>{
  let coveredRange = [];
  const Max_VALUE = 1000;
  for(const line of lines){
    let range = new vscode.Range((line-1),0,(line-1),Max_VALUE);
    coveredRange.push(range);
  }
  return coveredRange;
}

export function highlightCoverage(coverageObject, openedClass){

  let coveredRange = getRange(coverageObject.coveredLines);
  let uncoveredRange = getRange(coverageObject.uncoveredLines);
  decorationTypeCoveredLine = getDecorationForCoveredLines();
  decorationTypeUncoveredLine = getDecorationForUncoveredLines();

  openedClass.setDecorations(decorationTypeCoveredLine, coveredRange);
  openedClass.setDecorations(decorationTypeUncoveredLine, uncoveredRange);
}

export function cleanCoverage(openedClass){
  if(decorationTypeCoveredLine != null && decorationTypeUncoveredLine != null){
    openedClass.setDecorations(decorationTypeCoveredLine, []);
    openedClass.setDecorations(decorationTypeUncoveredLine, []);
  }
}

export function query(soql){
  let query = `sfdx force:data:soql:query -q "${soql}" -t -u "${Connection.getConnection().getUsername()}" --json`;
  let queryResult = execSync(query);
  return JSON.parse(queryResult.toString())["result"].records;
}

export async function asyncQuery(soql){
  let query = `sfdx force:data:soql:query -q "${soql}" -t -u "${Connection.getConnection().getUsername()}" --json`;
  let queryResult = await execAsync(query);
  return JSON.parse(queryResult.stdout)["result"].records;
}

export async function deleteRecords(SObjects){
  if(!SObjects || SObjects.length === 0) return;
  const objType = SObjects[0].attributes.type;
  const setIds = new Set(SObjects.map(object => object.Id));
  let csv = 'Id' + '\n';
  setIds.forEach(id => csv += id + '\n');
  const filePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,'tempDelete.csv');
  await writeFile(filePath, csv);
  await execAsync(`sfdx force:data:bulk:delete -s ${objType} -f ${filePath} -u "${Connection.getConnection().getUsername()}"`);
}

export async function deleteRecord(SObject){
  const objType = SObject.attributes.type;
  await execAsync(`sfdx force:data:record:delete -t -s${objType} -i ${SObject.Id} -u "${Connection.getConnection().getUsername()}"`);
}

export async function createRecord(objType, SObject){
  let values = '';
  for (let key in SObject) {
    values += (key + '=' + SObject[key] + ' ');
  }
  await execAsync(`sfdx force:data:record:create -t -s${objType} -v "${values}" -u "${Connection.getConnection().getUsername()}"`);
}

export async function upsertRecord(objType, SObject){
  let values = '';
  let id;
  for (let key in SObject) {
    if(key != "Id"){
      values += (key + '=' + SObject[key] + ' ');
    }else{
      id = SObject[key];
    }
  }
  if(!id){
    await execAsync(`sfdx force:data:record:create -t -s${objType} -v "${values}" -u "${Connection.getConnection().getUsername()}"`);
  }else{
    await execAsync(`sfdx force:data:record:update -t -s${objType} -i ${id} -v "${values}" -u "${Connection.getConnection().getUsername()}"`);
  }
}

export function isStandard(apiName){
  return !(apiName.slice(-3) === '__c');
}

export function remove__c(name){
  if(name.slice(-3) === '__c'){
    name = name.substring(0,name.length-3);
  }
  return name;
}