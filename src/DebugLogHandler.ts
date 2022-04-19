import {asyncQuery,deleteRecord,createRecord,deleteRecords} from './Utils';
import { Connection } from './Connection';
import { showTraceFlagStatus, hideTraceFlagStatus} from './StatusBar';
import * as vscode from 'vscode';
const LOG_TIMER_LENGTH_MINUTES = 60;
const MILLISECONDS_PER_MINUTE = 60000;
const TRACED_ENTITY_TYPES = ['User', 'Automated Process', 'Platform Integration User'];

export async function enableDebugLog() {
  try{
    const tracedEntityType = await vscode.window.showQuickPick(TRACED_ENTITY_TYPES, {placeHolder : 'Select Traced Entity Type'})
    if(tracedEntityType){
      await vscode.window.withProgress(
          {
            title: 'SPB: Get Debug Levels',
            location: vscode.ProgressLocation.Notification
          },
          () => Connection.getConnection().getDebugLevels()
        );

        let debuglevels = await Connection.getConnection().getDebugLevels();

        const debugLevelSelected = await vscode.window.showQuickPick(debuglevels.map(debuglog => debuglog.DeveloperName),{placeHolder : 'Select Debug Level'})
        if(debugLevelSelected){
          await vscode.window.withProgress(
            {
              title: 'SPB: Create Trace Flag',
              location: vscode.ProgressLocation.Notification
            },
            () => createTraceFlag(tracedEntityType, debuglevels.find(debuglevel => debuglevel.DeveloperName == debugLevelSelected))
          );
        }
    }
  }catch(error){
    console.log(error)
    vscode.window.showInformationMessage(error);
  }
}

async function createTraceFlag(tracedEntityType, debugLevel){
  const TracedEntitySfId = await getTraceEntityId(tracedEntityType);

  await deleteActiveTraceFlag(TracedEntitySfId);
  let expirationDate = new Date(
    Date.now() + LOG_TIMER_LENGTH_MINUTES * MILLISECONDS_PER_MINUTE
  );

  const newTraceFlag = {
    TracedEntityId : TracedEntitySfId,
    DebugLevelId : debugLevel.Id,
    StartDate : new Date(Date.now() - 10 * MILLISECONDS_PER_MINUTE).toISOString(),
    logtype: 'USER_DEBUG',
    ExpirationDate : expirationDate.toISOString()
  }
  await createRecord('TraceFlag',newTraceFlag);
  showTraceFlagStatus(tracedEntityType, newTraceFlag.ExpirationDate);
}

async function getTraceEntityId(tracedEntityType){
 let tracedEntityTypeId;
  if(tracedEntityType === 'User'){
    tracedEntityTypeId = await Connection.getConnection().getUserId();
  }else if(tracedEntityType === 'Automated Process'){
    tracedEntityTypeId = await Connection.getConnection().getAutomatedProcessUserId();
  }else{
    tracedEntityTypeId = await Connection.getConnection().getPlatformIntegrationUserId();
  }
  return tracedEntityTypeId;
}

export async function deleteActiveTraceFlag(TracedEntitySfId){
  const currentTraceFlag = await getActiveTraceFlag(TracedEntitySfId);
  if(currentTraceFlag){
    await deleteRecord(currentTraceFlag);
  }
}

async function getActiveTraceFlag(TracedEntitySfId){
  const NOW = new Date(Date.now()).toISOString();
  const traceFlags = await asyncQuery(`SELECT Id FROM TraceFlag WHERE TracedEntityId = '${TracedEntitySfId}' AND ExpirationDate >= ${NOW} ORDER BY ExpirationDate DESC LIMIT 1`, true);
  if(traceFlags || traceFlags.length > 0){
    return traceFlags[0];
  }else{
    return null;
  }
}

export async function disableDebugLog(){

  const tracedEntityType = await vscode.window.showQuickPick(TRACED_ENTITY_TYPES, {placeHolder : 'Select Traced Entity Type'});

  if(tracedEntityType){
    const TracedEntitySfId = await getTraceEntityId(tracedEntityType);

    await vscode.window.withProgress(
      {
        title: 'SPB: Delete Active Trace Flag',
        location: vscode.ProgressLocation.Notification
      },
      () => deleteActiveTraceFlag(TracedEntitySfId)
    );
    hideTraceFlagStatus(tracedEntityType);
  }
}

export async function deleteApexLogs(){
  const userChoise = await vscode.window.showQuickPick(['No','Yes'], {placeHolder : 'Are you sure you want to delete all the Apex Logs from the org?'})
  if(userChoise === 'Yes'){
    await vscode.window.withProgress(
      {
        title: 'Delete Apex Logs',
        location: vscode.ProgressLocation.Notification
      },
      () => deleteLogs()
    );
  }
}

async function deleteLogs(){
  let apexLogs = await asyncQuery(`SELECT Id FROM ApexLog ORDER BY LastModifiedDate ASC LIMIT 50000`, true);
  await deleteRecords(apexLogs);
}
