import {query,asyncQuery,deleteRecords} from './Utils';
import * as vscode from 'vscode';
import { Connection } from './Connection';

export async function enableDebugLog() {
  const debuglevels = query('SELECT Id,DeveloperName FROM Debuglevel');
  const debugLevelSelected = await vscode.window.showQuickPick(debuglevels.map(debuglog => debuglog.DeveloperName))
  await vscode.window.withProgress(
    {
      title: 'SFDX: Create Trace Flag',
      location: vscode.ProgressLocation.Notification
    },
    () => createDebugLog(debuglevels.find(debuglevel => debuglevel.DeveloperName == debugLevelSelected))
  );
}

async function createDebugLog(debugLog){
  const user = await asyncQuery(`SELECT Id FROM User WHERE Username = '${Connection.getInstance().userName}' LIMIT 1`);
  const userId = user[0].Id;
  const previousTraceFlags = await asyncQuery(`SELECT Id FROM TraceFlag WHERE TracedEntityId = '${userId}'`);// AND ExpirationDate > TODAY
  await deleteRecords(previousTraceFlags);
  // const newTraceFlag =
  // await createTraceFlag()
}
