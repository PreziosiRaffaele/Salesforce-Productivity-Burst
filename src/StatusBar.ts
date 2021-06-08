import * as vscode from 'vscode';
const traceFlagStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 40);

export function showTraceFlagStatus(traceFlag){
  traceFlagStatus.text = 'Trace Flag until : ' + new Date(traceFlag.ExpirationDate).toLocaleTimeString();
  traceFlagStatus.show();
}

export function resetStatusBar(){
  traceFlagStatus.hide();
}