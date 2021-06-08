import {query,asyncQuery,deleteRecord,createRecord} from './Utils';
import { Connection } from './Connection';
import { showTraceFlagStatus } from './StatusBar';
import * as vscode from 'vscode';

export async function enableDebugLog() {
  try{
    Connection.getConnection();
  }catch(error){
    vscode.window.showInformationMessage(error);
    return;
  }
  const debuglevels = query('SELECT Id,DeveloperName FROM Debuglevel');
  const debugLevelSelected = await vscode.window.showQuickPick(debuglevels.map(debuglog => debuglog.DeveloperName),{placeHolder : 'Select Debug Level'})
  if(debugLevelSelected){
    await vscode.window.withProgress(
      {
        title: 'SFDX: Create Trace Flag',
        location: vscode.ProgressLocation.Notification
      },
      () => createTraceFlag(debuglevels.find(debuglevel => debuglevel.DeveloperName == debugLevelSelected))
    );
  }
}

async function createTraceFlag(debugLevel){
  const LOG_TIMER_LENGTH_MINUTES = 60;
  const MILLISECONDS_PER_MINUTE = 60000;
  const currentTraceFlag = await getCurrentTraceFlag();
  if(currentTraceFlag){
    await deleteRecord(currentTraceFlag);
  }
  let expirationDate = new Date(
    Date.now() + LOG_TIMER_LENGTH_MINUTES * MILLISECONDS_PER_MINUTE
  );
  const newTraceFlag = {
    TracedEntityId : Connection.getConnection().getUserId(),
    DebugLevelId : debugLevel.Id,
    StartDate : new Date(Date.now()).toISOString(),
    logtype: 'developer_log',
    ExpirationDate : expirationDate.toISOString()
  }
  await createRecord('TraceFlag',newTraceFlag);
  showTraceFlagStatus(newTraceFlag);
}


async function getCurrentTraceFlag(){
  const NOW = new Date(Date.now()).toISOString();
  const traceFlags = await asyncQuery(`SELECT Id FROM TraceFlag WHERE TracedEntityId = '${Connection.getConnection().getUserId()}' AND ExpirationDate >= ${NOW} ORDER BY ExpirationDate DESC LIMIT 1`);
  if(traceFlags || traceFlags.length > 0){
    return traceFlags[0];
  }else{
    return null;
  }
}
