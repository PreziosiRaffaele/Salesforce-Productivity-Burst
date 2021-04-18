import * as vscode from 'vscode';

export function getDecorationForCoveredLines(){
  let opacity = Number(vscode.workspace.getConfiguration().get('apexGetCoverage.Brightness'))/100;
  let color = `rgba(` + vscode.workspace.getConfiguration().get('apexGetCoverage.CoveredLinesColor') + `, ${opacity})`;
  return vscode.window.createTextEditorDecorationType(
    {
      backgroundColor: color,
      borderRadius: '.2em',
      overviewRulerColor: color
    }
  );
}

export function getDecorationForUncoveredLines(){
  let opacity = Number(vscode.workspace.getConfiguration().get('apexGetCoverage.Brightness'))/100;
  let color = `rgba(` + vscode.workspace.getConfiguration().get('apexGetCoverage.UncoveredLinesColor') + `, ${opacity})`;
  return vscode.window.createTextEditorDecorationType(
    {
      backgroundColor: color,
      borderRadius: '.2em',
      overviewRulerColor: color
    }
  );
}