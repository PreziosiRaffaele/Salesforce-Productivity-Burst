'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
//import {VSCExpress} from 'vscode-express';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // This line of code will only be executed once when your extension is activated

	//const vscexpress = new VSCExpress(context, 'view');

	let defaultOrg;
	let userName;
	const fs = require('fs');
	const { execSync } = require('child_process');

	let mapNameClass_MapMethodName_Coverage = new Map();
	let mapNameClass_TotalCoverage = new Map();

    context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {

		const openedClass = vscode.window.activeTextEditor;
		const pathClass = openedClass.document.fileName;

		if(isInvalidFile(pathClass)){
			vscode.window.showInformationMessage('Apex Class not found');
			return;
		}

		const className = pathClass.substring(pathClass.lastIndexOf("\\")+1,pathClass.lastIndexOf("."));

		if(!mapNameClass_MapMethodName_Coverage.has(className)){
			const sfdxConfigPath = pathClass.substring(0,pathClass.lastIndexOf("force-app")) + ".sfdx/sfdx-config.json";

			const json = JSON.parse(fs.readFileSync(sfdxConfigPath));

			let currentSfOrg = json["defaultusername"];

			if(currentSfOrg != defaultOrg){ //L'utente ha cambiato ORG
				defaultOrg = currentSfOrg;
				let result = execSync('sfdx force:auth:list');
				userName = getUsername(result.toString(), defaultOrg);
				console.log(userName);
			}

			getTestMethodsCoverage(className);
			getClassTotalCoverage(className);
		}

		let totalCoverage = 'Total Coverage - ' + mapNameClass_TotalCoverage.get(className) + '%';
		const refresh_data = 'Refresh Data';
		let items = [refresh_data, totalCoverage];
		let mapMethodName_Coverage = mapNameClass_MapMethodName_Coverage.get(className);

		for (const entry of mapMethodName_Coverage.entries()) {
			let methodCoverage = (entry[1].NumLinesCovered / (entry[1].NumLinesCovered + entry[1].NumLinesUncovered)) * 100;
			items.push(entry[0] + ' - ' + methodCoverage.toFixed(2) + '%');
		}

		console.log(items);

		vscode.window.showQuickPick(items, {
			onDidSelectItem: (item) => {
			   // do something with item
			}
		}).then((selection) => {
			// User made final selection
			if (!selection) {
				return
			}
		})

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
		let query = 'sfdx force:data:soql:query -q "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate WHERE ApexClassOrTrigger.Name = \'' + className + '\'" -t -u ' + '"' + userName + '" --json';

		let resultQuery = execSync(query);

		let jsonCodeCoverage = JSON.parse(resultQuery);

		let NumLinesCovered = jsonCodeCoverage["result"].records[0].NumLinesCovered;
		let NumLinesUncovered = jsonCodeCoverage["result"].records[0].NumLinesUncovered;
		let totalCoverage = NumLinesCovered/(NumLinesCovered + NumLinesUncovered) * 100;

		mapNameClass_TotalCoverage.set(className,totalCoverage.toFixed(2));

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

	/* 	SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate WHERE ApexClassOrTrigger.Name = 'DeliveryConstants'*/
	// Select TestMethodName, NumLinesCovered, NumLinesUncovered, Coverage from ApexCodeCoverage where ApexClassOrTrigger.name = 'DeliveryUtils' order by createddate desc LIMIT 10
	//vscexpress.open('getCoverage.html', 'SFDX Get Coverage', vscode.ViewColumn.One);
	//posso ottenere i dettagli della org attraverso il comando display default org details for default org
	//vscode.commands.executeCommand('sfdx.force.data.soql.query.selection');
	//let command = 'sfdx force:data:soql:query -q "SELECT Id, Name, Account.Name FROM Contact"';
}

// this method is called when your extension is deactivated
export function deactivate() {
}

