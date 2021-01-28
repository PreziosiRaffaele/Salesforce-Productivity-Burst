'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
//import {VSCExpress} from 'vscode-express';
//import * as cp from 'child_process';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "hello" is now active!');

	//const vscexpress = new VSCExpress(context, 'view');
	const fs = require('fs');
	fs.readFile('/VSProjects/DeveloperEdition2/.sfdx/sfdx-config.json', 'utf8', function (err,data) {
		if (err) {
		  return console.log(err);
		}
		let json = JSON.parse(data)
		var defaultOrg = console.log(json["defaultusername"]);
	});



    context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {
		const { exec } = require('child_process');

		exec('sfdx force:data:soql:query -q "SELECT Id, Name, Account.Name FROM Contact LIMIT 1" -u "ra.preziosi@devedition.it"', (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
				console.log(`stdout: ${stdout}`);
				console.error(`stderr: ${stderr}`);
		});
		//vscexpress.open('getCoverage.html', 'SFDX Get Coverage', vscode.ViewColumn.One);
		//posso ottenere i dettagli della org attraverso il comando display default org details for default org
		//vscode.commands.executeCommand('sfdx.force.data.soql.query.selection');

		//let command = 'sfdx force:data:soql:query -q "SELECT Id, Name, Account.Name FROM Contact"';

	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

