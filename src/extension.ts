'use strict';
import * as vscode from 'vscode';
import { getCoverage } from './GetCoverageHandler';
import { enableDebugLog, disableDebugLog, deleteApexLogs } from './DebugLogHandler';

export function activate(context: vscode.ExtensionContext) {

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
}

export function deactivate() {
}

