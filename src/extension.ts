'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
//import {VSCExpress} from 'vscode-express';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // This line of code will only be executed once when your extension is activated

	let defaultOrg;
	let userName;
	const fs = require('fs');
	const { execSync } = require('child_process');

	let mapNameClass_MapMethodName_Coverage;
	let mapNameClass_TotalCoverage;

	const lime = (opacity: number): string => `rgba(45, 121, 11, ${opacity})`;
	const red = (opacity: number): string => `rgba(253, 72, 73, ${opacity})`;

	let coveredLinesDecorationType = vscode.window.createTextEditorDecorationType(
	{
		backgroundColor: lime(0.5),
		borderRadius: '.2em',
		overviewRulerColor: lime(0.5)
	});

	let uncoveredLinesDecorationType = vscode.window.createTextEditorDecorationType(
	{
		backgroundColor: red(0.5),
		borderRadius: '.2em',
		overviewRulerColor: red(0.5)
	});

    context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {

		const openedClass = vscode.window.activeTextEditor;
		openedClass.setDecorations(coveredLinesDecorationType, []);
		openedClass.setDecorations(uncoveredLinesDecorationType, []);

		// let range = [new vscode.Range(new vscode.Position(1,0), new vscode.Position(3,20)), new vscode.Range(new vscode.Position(1,0), new vscode.Position(4,20))];

		// openedClass.setDecorations(coveredLinesDecorationType, range);

		const pathClass = openedClass.document.fileName;

		if(isInvalidFile(pathClass)){
			vscode.window.showInformationMessage('Apex Class not found');
			return;
		}

		const className = pathClass.substring(pathClass.lastIndexOf("\\")+1,pathClass.lastIndexOf("."));

		const sfdxConfigPath = pathClass.substring(0,pathClass.lastIndexOf("force-app")) + ".sfdx/sfdx-config.json";

		const json = JSON.parse(fs.readFileSync(sfdxConfigPath));

		let currentSfOrg = json["defaultusername"];

		if(currentSfOrg != defaultOrg){ //L'utente ha cambiato ORG
			mapNameClass_MapMethodName_Coverage = new Map();
			mapNameClass_TotalCoverage = new Map();
			defaultOrg = currentSfOrg;
			let result = execSync('sfdx force:auth:list');
			userName = getUsername(result.toString(), defaultOrg);
			console.log(userName);
		}

		if(!mapNameClass_MapMethodName_Coverage.has(className)){
			getTestMethodsCoverage(className);
			getClassTotalCoverage(className);
		}

		const refresh_data = 'Refresh Data';
		let options = [refresh_data];
		let recordTotalCoverage = mapNameClass_TotalCoverage.get(className)[0];
		let methodCoverage = (recordTotalCoverage.NumLinesCovered / (recordTotalCoverage.NumLinesCovered + recordTotalCoverage.NumLinesUncovered)) * 100;
		options.push('Total Coverage' + ' - ' + methodCoverage.toFixed(2) + '%');

		//highlightCoverage(recordTotalCoverage.Coverage, openedClass);

		let mapMethodName_Coverage = mapNameClass_MapMethodName_Coverage.get(className);

		for (const entry of mapMethodName_Coverage.entries()) {
			let methodCoverage = (entry[1].NumLinesCovered / (entry[1].NumLinesCovered + entry[1].NumLinesUncovered)) * 100;
			options.push(entry[0] + ' - ' + methodCoverage.toFixed(2) + '%');
		}

		console.log(options);

		vscode.window.showQuickPick(options).then(selection => {
			// the user canceled the selection
			if (!selection) {
			  return;
			}
			let selected = selection.split(' - ')[0].trim();

			if(selection == refresh_data){

			}else if(selected == 'Total Coverage'){
				highlightCoverage(recordTotalCoverage.Coverage, openedClass);
			}else{
				highlightCoverage(mapMethodName_Coverage.get(selected).Coverage, openedClass);
			}
		});

	}));

	function getTestMethodsCoverage(className){
		let query = 'sfdx force:data:soql:query -q "Select TestMethodName, NumLinesCovered, NumLinesUncovered, Coverage from ApexCodeCoverage where ApexClassOrTrigger.name = \'' + className + '\' order by createddate desc LIMIT 20" -t -u ' + '"' + userName + '" --json';

		let resultQuery = execSync(query);

		let mapMethodName_Coverage = new Map();

		let records = JSON.parse(resultQuery)["result"].records;

		console.log(records);

		records.forEach(record => {
			mapMethodName_Coverage.set(record.TestMethodName, record);
		});

		mapNameClass_MapMethodName_Coverage.set(className, mapMethodName_Coverage);

	}

	function getClassTotalCoverage(className){
		let query = 'sfdx force:data:soql:query -q "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage FROM ApexCodeCoverageAggregate WHERE ApexClassOrTrigger.Name = \'' + className + '\'" -t -u ' + '"' + userName + '" --json';

		let resultQuery = execSync(query);

		let records = JSON.parse(resultQuery)["result"].records;

		mapNameClass_TotalCoverage.set(className, records);

	}

	function getUsername(orgList, defaultOrg){
		let posInizialeRiga = orgList.indexOf(defaultOrg);
		let posFinaleRiga = orgList.indexOf("\n", posInizialeRiga);

		let riga = orgList.substring(posInizialeRiga,posFinaleRiga);

		let arrayWords = riga.split(" ");
		let arrayWordsSenzaSpazi = [];

		arrayWords.forEach(function(element){
			if(element)
			{
				arrayWordsSenzaSpazi.push(element);
			}
		});

		return arrayWordsSenzaSpazi[1].trim();
	}

	function isInvalidFile(pathClass){
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

	function getRange(lines){
		let coveredRange = [];
		const Max_VALUE = 1000;
		for(const line of lines){
			let range = new vscode.Range((line-1),0,(line-1),Max_VALUE);
			coveredRange.push(range);
		}
		return coveredRange;
	}

	function highlightCoverage(coverageObject, openedClass){
		let coveredRange = getRange(coverageObject.coveredLines);
		let uncoveredRange = getRange(coverageObject.uncoveredLines);

		openedClass.setDecorations(coveredLinesDecorationType, coveredRange);
		openedClass.setDecorations(uncoveredLinesDecorationType, uncoveredRange);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
}

