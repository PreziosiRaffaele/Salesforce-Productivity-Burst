import * as vscode from 'vscode';

export function getDecorationForCoveredLines(){
  let opacity = Number(vscode.workspace.getConfiguration().get('getCoverage.Brightness'))/100;
  let color = `rgba(` + vscode.workspace.getConfiguration().get('getCoverage.CoveredLinesColor') + `, ${opacity})`;
  return vscode.window.createTextEditorDecorationType(
    {
      backgroundColor: color,
      borderRadius: '.2em',
      overviewRulerColor: color
    }
  );
}

export function getDecorationForUncoveredLines(){
  let opacity = Number(vscode.workspace.getConfiguration().get('getCoverage.Brightness'))/100;
  let color = `rgba(` + vscode.workspace.getConfiguration().get('getCoverage.UncoveredLinesColor') + `, ${opacity})`;
  return vscode.window.createTextEditorDecorationType(
    {
      backgroundColor: color,
      borderRadius: '.2em',
      overviewRulerColor: color
    }
  );
}