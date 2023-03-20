
import { isInvalidFile, getCurrentClassName, highlightCoverage, cleanCoverage } from './Utils';
import * as vscode from 'vscode';
const REFRESH_DATA = 'Refresh Data';
const TOTAL_COVERAGE = 'Total Coverage';

export async function getCoverage(conn) {

    const openedClass = vscode.window.activeTextEditor;
    if (!openedClass || isInvalidFile(openedClass)) {
        vscode.window.showInformationMessage('Apex Class or Trigger not found');
        return;
    }

    cleanCoverage(openedClass);

    const className = getCurrentClassName();

    if (!conn.mapNameClass_MapMethodName_Coverage.has(className)) {
        await vscode.window.withProgress(
            {
                title: 'SPB: Get Coverage - ' + className,
                location: vscode.ProgressLocation.Notification
            },
            () => runAsync(conn, className)
        );
    }

    if (!conn.mapNameClass_MapMethodName_Coverage.has(className)) {
        vscode.window.showInformationMessage('No Coverage found for this Class/Trigger. Run Test Class!');
        return;
    }

    let options = getOptions(conn, className);
    let selection = await vscode.window.showQuickPick(options, { placeHolder: 'Select Test Method' });
    if (!selection) {
        return;
    }
    let selected = selection.split(' - ')[0].trim();
    if (selection == REFRESH_DATA) {
        conn.mapNameClass_MapMethodName_Coverage.delete(className);
        conn.mapNameClass_TotalCoverage.delete(className);
        vscode.commands.executeCommand('extension.getCoverage');
    } else if (selected == TOTAL_COVERAGE) {
        highlightCoverage(conn.mapNameClass_TotalCoverage.get(className)[0].Coverage, openedClass);
    } else {
        highlightCoverage(conn.mapNameClass_MapMethodName_Coverage.get(className).get(selected).Coverage, openedClass);
    }
}

async function runAsync(conn, className) {
    const [listCodeCoverage, codeCoverageAggregate] = await Promise.all([conn.query('SELECT ApexTestClass.Name,TestMethodName, NumLinesCovered, NumLinesUncovered, Coverage '
        + 'FROM ApexCodeCoverage '
        + 'WHERE ApexClassOrTrigger.name = \'' + className + '\' order by createddate desc LIMIT 20', true),
        conn.query('SELECT ApexClassOrTrigger.Name, NumLinesCovered, NumLinesUncovered, Coverage '
        + 'FROM ApexCodeCoverageAggregate '
        + 'WHERE ApexClassOrTrigger.Name = \'' + className + '\'', true)]);
    if (listCodeCoverage.length > 0) {
        let mapMethodName_Coverage = new Map();
        listCodeCoverage.forEach(record => {
            mapMethodName_Coverage.set(record.ApexTestClass.Name + '.' + record.TestMethodName, record);
        });
        conn.mapNameClass_MapMethodName_Coverage.set(className, mapMethodName_Coverage);
        conn.mapNameClass_TotalCoverage.set(className, codeCoverageAggregate);
    }
}

function getOptions(conn, className) {
    let options = [REFRESH_DATA];
    let recordTotalCoverage = conn.mapNameClass_TotalCoverage.get(className)[0];
    let methodCoverage = (recordTotalCoverage.NumLinesCovered / (recordTotalCoverage.NumLinesCovered + recordTotalCoverage.NumLinesUncovered)) * 100;
    options.push(TOTAL_COVERAGE + ' - ' + methodCoverage.toFixed(2) + '%');

    let mapMethodName_Coverage = conn.mapNameClass_MapMethodName_Coverage.get(className);

    for (const entry of mapMethodName_Coverage.entries()) {
        let methodCoverage = (entry[1].NumLinesCovered / (entry[1].NumLinesCovered + entry[1].NumLinesUncovered)) * 100;
        options.push(entry[0] + ' - ' + methodCoverage.toFixed(2) + '%');
    }

    return options;
}