import {asyncQuery,deleteRecord,createRecord,deleteRecords} from './Utils';
import { Connection } from './Connection';
import { showTraceFlagStatus, hideTraceFlagStatus} from './StatusBar';
import * as vscode from 'vscode';
const LOG_TIMER_LENGTH_MINUTES = 60;
const MILLISECONDS_PER_MINUTE = 60000;

export async function enableDebugLog() {
  const debuglevels = Connection.getConnection().getDebugLevels();
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
  await deleteActiveTraceFlag();
  let expirationDate = new Date(
    Date.now() + LOG_TIMER_LENGTH_MINUTES * MILLISECONDS_PER_MINUTE
  );
  const newTraceFlag = {
    TracedEntityId : Connection.getConnection().getUserId(),
    DebugLevelId : debugLevel.Id,
    StartDate : new Date(Date.now() - 10 * MILLISECONDS_PER_MINUTE).toISOString(),
    logtype: 'developer_log',
    ExpirationDate : expirationDate.toISOString()
  }
  await createRecord('TraceFlag',newTraceFlag);
  showTraceFlagStatus(newTraceFlag);
}

export async function disableDebugLog(){
  await vscode.window.withProgress(
    {
      title: 'SFDX: Delete Active Trace Flag',
      location: vscode.ProgressLocation.Notification
    },
    () => deleteActiveTraceFlag()
  );
  hideTraceFlagStatus();
}

export async function deleteActiveTraceFlag(){
  const currentTraceFlag = await getActiveTraceFlag();
  if(currentTraceFlag){
    await deleteRecord(currentTraceFlag);
  }
}

async function getActiveTraceFlag(){
  const NOW = new Date(Date.now()).toISOString();
  const traceFlags = await asyncQuery(`SELECT Id FROM TraceFlag WHERE TracedEntityId = '${Connection.getConnection().getUserId()}' AND ExpirationDate >= ${NOW} ORDER BY ExpirationDate DESC LIMIT 1`);
  if(traceFlags || traceFlags.length > 0){
    return traceFlags[0];
  }else{
    return null;
  }
}

export async function deleteApexLogs(){
  await vscode.window.withProgress(
    {
      title: 'Delete Apex Logs',
      location: vscode.ProgressLocation.Notification
    },
    () => deleteLogs()
  );
}

async function deleteLogs(){
  let apexLogs = await asyncQuery(`SELECT Id FROM ApexLog ORDER BY LastModifiedDate ASC LIMIT 50000`);
  await deleteRecords(apexLogs);
}
