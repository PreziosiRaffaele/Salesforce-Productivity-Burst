'use strict';
import * as vscode from 'vscode';
import { Stato } from './stato';
import { getCurrentOrg } from './Utils';
import { run } from './GetCoverageHandler';

export function activate(context: vscode.ExtensionContext) {

  let stato = new Stato(getCurrentOrg());

  context.subscriptions.push(vscode.commands.registerCommand('extension.getCoverage', () => {
    run(stato);
  }));
}

export function deactivate() {
}

