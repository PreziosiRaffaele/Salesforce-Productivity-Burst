'use strict';
import * as vscode from 'vscode';
import { getCoverage } from './GetCoverageHandler';
import { enableDebugLog } from './DebugLogHandler';

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {
    getCoverage();
  }));

  context.subscriptions.push(vscode.commands.registerCommand('extension.TurnOnApexDebug', () => {
    enableDebugLog();
  }));
}

export function deactivate() {
}

