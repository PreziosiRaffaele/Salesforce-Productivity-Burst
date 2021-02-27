'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * @returns the connected Sf Org Name
 */
export function getCurrentOrg() : String {
  const sfdxConfigPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,'/.sfdx','sfdx-config.json');
  const bodyConfig = fs.readFileSync(sfdxConfigPath, 'utf-8');
  const jsonConfig = JSON.parse(bodyConfig);
  return jsonConfig["defaultusername"];
}

/**
 * @returns the opened Class Name
 */
export function getCurrentClassName(openedClass) : String {
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

export function getRange(lines){
  let coveredRange = [];
  const Max_VALUE = 1000;
  for(const line of lines){
    let range = new vscode.Range((line-1),0,(line-1),Max_VALUE);
    coveredRange.push(range);
  }
  return coveredRange;
}

export function highlightCoverage(coverageObject, openedClass){

  const lime = (opacity: number): string => `rgba(45, 121, 11, ${opacity})`;
	const red = (opacity: number): string => `rgba(253, 72, 73, ${opacity})`;

	let coveredLinesDecorationType = vscode.window.createTextEditorDecorationType(
	{
		backgroundColor: lime(0.3),
		borderRadius: '.2em',
		overviewRulerColor: lime(0.3)
	});

	let uncoveredLinesDecorationType = vscode.window.createTextEditorDecorationType(
	{
		backgroundColor: red(0.3),
		borderRadius: '.2em',
		overviewRulerColor: red(0.3)
	});

  let coveredRange = getRange(coverageObject.coveredLines);
  let uncoveredRange = getRange(coverageObject.uncoveredLines);

  openedClass.setDecorations(coveredLinesDecorationType, coveredRange);
  openedClass.setDecorations(uncoveredLinesDecorationType, uncoveredRange);
}
