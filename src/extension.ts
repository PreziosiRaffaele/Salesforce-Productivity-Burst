'use strict';
import * as vscode from 'vscode';
import { run } from './GetCoverageHandler';

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {
    run();
  }));
}

export function deactivate() {
}

