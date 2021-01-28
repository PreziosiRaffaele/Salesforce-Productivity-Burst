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

	var defaultOrg;
	var userName;

    context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {

		let className = 'EnrollmentTriggerHandler';


		const fs = require('fs');
		fs.readFile('/VSProjects/DeveloperEdition2/.sfdx/sfdx-config.json', 'utf8', function (err,data) { //SOSTITUISCI IL PATH
			if (err) {
			  return console.log(err);
			}
			let json = JSON.parse(data)
			let defaultOrg2 = json["defaultusername"];

			const { exec } = require('child_process');

			console.log(defaultOrg);
			console.log(defaultOrg2);

			if(defaultOrg2 != defaultOrg){
				defaultOrg = defaultOrg2
				exec('sfdx force:auth:list', (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}

					console.log(`stdout: ${stdout}`);
					let y = typeof(stdout);
					console.log(y);
					console.log(defaultOrg);

					userName = getUsername(stdout, defaultOrg);
					console.log(userName);
					console.error(`stderr: ${stderr}`);

					let query = 'sfdx force:data:soql:query -q "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate WHERE ApexClassOrTrigger.Name = \'' + className + '\'" -t -u ' + '"' + userName + '" --json';

					exec(query, (error, stdout, stderr) => {
						if (error) {
							console.error(`exec error: ${error}`);
							return;
						}
							console.log(`stdout: ${stdout}`);

							let jsonCodeCoverage = JSON.parse(stdout);

							let NumLinesCovered = jsonCodeCoverage["result"].records[0].NumLinesCovered;
							console.log(NumLinesCovered);
							let NumLinesUncovered = jsonCodeCoverage["result"].records[0].NumLinesUncovered;
							console.log(NumLinesUncovered);
							let percentuale = NumLinesCovered/(NumLinesCovered + NumLinesUncovered);

							console.log(percentuale);
							console.error(`stderr: ${stderr}`);
							let message = className + ' -- ';
							message += 	'Coverage : ' + percentuale + '%' + ' -- ';
							message +=	'Number Lines Covered : ' + NumLinesCovered + ' -- ';
							message +=	'Number Lines Uncovered : ' + NumLinesUncovered;
							if(percentuale < 75){
								let numeroDiLineeRimanenti = 75/100*(NumLinesCovered + NumLinesUncovered) - NumLinesCovered;
								message += ' -- ' +	'Number Lines To Reach 75% : ' + numeroDiLineeRimanenti;
							}
							vscode.window.showInformationMessage(message);
					});
				});
			}else{
				let query = 'sfdx force:data:soql:query -q "SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate WHERE ApexClassOrTrigger.Name = \'' + className + '\'" -t -u ' + '"' + userName + '" --json';

					exec(query, (error, stdout, stderr) => {
						if (error) {
							console.error(`exec error: ${error}`);
							return;
						}
							console.log(`stdout: ${stdout}`);

							let jsonCodeCoverage = JSON.parse(stdout);

							let NumLinesCovered = jsonCodeCoverage["result"].records[0].NumLinesCovered;
							console.log(NumLinesCovered);
							let NumLinesUncovered = jsonCodeCoverage["result"].records[0].NumLinesUncovered;
							console.log(NumLinesUncovered);
							let percentuale = NumLinesCovered/(NumLinesCovered + NumLinesUncovered);

							console.log(percentuale);
							console.error(`stderr: ${stderr}`);
							let message = className + ' -- ';
							message += 	'Coverage : ' + percentuale + '%' + ' -- ';
							message +=	'Number Lines Covered : ' + NumLinesCovered + ' -- ';
							message +=	'Number Lines Uncovered : ' + NumLinesUncovered;
							if(percentuale < 75){
								let numeroDiLineeRimanenti = 75/100*(NumLinesCovered + NumLinesUncovered) - NumLinesCovered;
								message += ' -- ' +	'Number Lines To Reach 75% : ' + numeroDiLineeRimanenti;
							}
							vscode.window.showInformationMessage(message);
					});
			}


		});

		/* 	SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered FROM ApexCodeCoverageAggregate WHERE ApexClassOrTrigger.Name = 'DeliveryConstants'*/

		//vscexpress.open('getCoverage.html', 'SFDX Get Coverage', vscode.ViewColumn.One);
		//posso ottenere i dettagli della org attraverso il comando display default org details for default org
		//vscode.commands.executeCommand('sfdx.force.data.soql.query.selection');
		//let command = 'sfdx force:data:soql:query -q "SELECT Id, Name, Account.Name FROM Contact"';

	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function getUsername(orgList, defaultOrg){
	let posInizialeRiga = orgList.indexOf(defaultOrg);
	let posFinaleRiga = orgList.indexOf("\n", posInizialeRiga);

	let riga = orgList.substring(posInizialeRiga,posFinaleRiga);
	console.log("orgList" + orgList);
	console.log("defaultOrg" + defaultOrg);
	console.log("posInizialeRiga" + posInizialeRiga);
	console.log("posFinaleRiga" + posFinaleRiga);

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
