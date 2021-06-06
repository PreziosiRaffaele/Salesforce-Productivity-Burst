import {query,asyncQuery,deleteRecord,createRecord} from './Utils';
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

async function createDebugLog(debugLevel){
  const LOG_TIMER_LENGTH_MINUTES = 30;
  const MILLISECONDS_PER_MINUTE = 60000;
  const user = await asyncQuery(`SELECT Id FROM User WHERE Username = '${Connection.getInstance().userName}' LIMIT 1`);
  const userId = user[0].Id;
  const previousTraceFlag = await asyncQuery(`SELECT Id FROM TraceFlag WHERE TracedEntityId = '${userId}' AND ExpirationDate >= TODAY ORDER BY ExpirationDate DESC LIMIT 1`);
  if(previousTraceFlag.length === 1){
    await deleteRecord(previousTraceFlag[0]);
  }
  let expirationDate = new Date(
    Date.now() + LOG_TIMER_LENGTH_MINUTES * MILLISECONDS_PER_MINUTE
  );

  const newTraceFlag = {
    TracedEntityId : userId,
    DebugLevelId : debugLevel.Id,
    StartDate : '',
    logtype: 'developer_log',
    ExpirationDate : expirationDate.toISOString()
  }
  await createRecord('TraceFlag',newTraceFlag);
}
