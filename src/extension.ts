'use strict';
import * as vscode from 'vscode';
import { getCoverage } from './GetCoverageHandler';
import { runClassInfo } from './GetClassInfoHandler';
import { enableDebugLog, disableDebugLog, deleteApexLogs } from './DebugLogHandler';
import { createButtonLinkSF } from './StatusBar';
import { Connection } from './Connection';
import { openOnSaleforce }from './OpenOnSalesforceHandler';

export function activate(context: vscode.ExtensionContext) {

  Connection.getConnection();

  context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {
    getCoverage();
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

  context.subscriptions.push(vscode.commands.registerCommand('extension.getClassInfo', () => {
    runClassInfo();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.openOnSaleforce', () => {
    openOnSaleforce();
  }));

  createButtonLinkSF();
}

export function deactivate() {
}

