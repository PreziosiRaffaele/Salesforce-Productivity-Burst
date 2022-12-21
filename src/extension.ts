'use strict';
import * as vscode from 'vscode';
import { getCoverage } from './GetCoverageHandler';
import { enableDebugLog, disableDebugLog, deleteApexLogs } from './DebugLogHandler';
import { createButtonLinkSF } from './StatusBar';
import { Connection } from './Connection';
import { refreshMetadata } from './GetDataFromOrg';
import { openOnSaleforce }from './OpenOnSalesforceHandler';
export let cont;

export function activate(context: vscode.ExtensionContext) {
  console.time('SPB Activation time');

  Connection.getConnection();

  context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {
    getCoverage();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.refreshMetadata', () => {
    refreshMetadata();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.createTraceFlag', () => {
    enableDebugLog();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.deleteActiveTraceFlag', () => {
    disableDebugLog();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.deleteApexLogs', () => {
    deleteApexLogs();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.openOnSaleforce', () => {
    openOnSaleforce();
  }));

  createButtonLinkSF();

  cont = context;
  console.log("Salesforce Productivity Burst Activated")
  console.timeEnd('SPB Activation time');
}

export function deactivate() {
  console.log("Salesforce Productivity Burst Deactivated")
}

