'use strict';
import * as vscode from 'vscode';
import { getCoverage } from './GetCoverageHandler';
import { enableDebugLog, disableDebugLog, deleteApexLogs } from './DebugLogHandler';
import { createButtonLinkSF } from './StatusBar';
import { Connection } from './Connection';
import { refreshMetadata } from './GetDataFromOrg';
import { openOnSaleforce }from './OpenOnSalesforceHandler';

export function activate(context: vscode.ExtensionContext) {
  console.time('SPB Activation time');

  context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {
    Connection.getConnection()
        .then((conn) => {
            getCoverage(conn);
        })
        .catch((err) => {
            vscode.window.showInformationMessage(err);
        })
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.refreshMetadata', () => {
    Connection.getConnection()
    .then((conn) => {
        refreshMetadata(conn);
    })
    .catch((err) => {
        vscode.window.showInformationMessage(err);
    })
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.createTraceFlag', () => {
    Connection.getConnection()
    .then((conn) => {
        enableDebugLog(conn);
    })
    .catch((err) => {
        vscode.window.showInformationMessage(err);
    })
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.deleteActiveTraceFlag', () => {
    Connection.getConnection()
    .then((conn) => {
        disableDebugLog(conn);
    })
    .catch((err) => {
        vscode.window.showInformationMessage(err);
    })
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.deleteApexLogs', () => {
    Connection.getConnection()
    .then((conn) => {
        deleteApexLogs(conn);
    })
    .catch((err) => {
        vscode.window.showInformationMessage(err);
    })
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.openOnSaleforce', () => {
    Connection.getConnection()
    .then((conn) => {
        openOnSaleforce(conn);
    })
    .catch((err) => {
        vscode.window.showInformationMessage(err);
    })
  }));

  createButtonLinkSF();

  console.log("Salesforce Productivity Burst Activated")
  console.timeEnd('SPB Activation time');
}

export function deactivate() {
  console.log("Salesforce Productivity Burst Deactivated")
}

