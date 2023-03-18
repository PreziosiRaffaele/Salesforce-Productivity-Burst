import { showTraceFlagStatus, hideTraceFlagStatus } from './StatusBar';
import { findData, filterData } from './GetDataFromOrg'
import * as vscode from 'vscode';
const LOG_TIMER_LENGTH_MINUTES = 60;
const MILLISECONDS_PER_MINUTE = 60000;
const TRACED_ENTITY_TYPES = ['User', 'Automated Process', 'Platform Integration User'];

export async function enableDebugLog(conn) {
    try {
        Promise.all([vscode.window.showQuickPick(TRACED_ENTITY_TYPES, { placeHolder: 'Select Traced Entity Type' }), vscode.window.withProgress(
            {
                title: 'SPB: Get Debug Levels',
                location: vscode.ProgressLocation.Notification
            },
            () => filterData(conn, 'DebugLevel', {})
        )]).then((values) => {
            let tracedEntityType = values[0];
            if(Array.isArray(values[1])){
                let debuglevels = values[1];
                vscode.window.showQuickPick(debuglevels.map(debuglog => debuglog["DeveloperName"]), { placeHolder: 'Select Debug Level' }).then((debugLevelSelected) => {
                    if (debugLevelSelected) {
                        vscode.window.withProgress(
                            {
                                title: 'SPB: Create Trace Flag',
                                location: vscode.ProgressLocation.Notification
                            },
                            () => createTraceFlag(conn, tracedEntityType, debuglevels.find(debuglevel => debuglevel["DeveloperName"] == debugLevelSelected))
                        );
                    }
                })
            }
        })
    } catch (error) {
        console.log(error)
        vscode.window.showInformationMessage(error);
    }
}

async function createTraceFlag(conn, tracedEntityType, debugLevel) {
    const TracedEntitySfId = await getTraceEntityId(conn, tracedEntityType);

    await deleteActiveTraceFlag(conn, TracedEntitySfId);
    let expirationDate = new Date(
        Date.now() + LOG_TIMER_LENGTH_MINUTES * MILLISECONDS_PER_MINUTE
    );

    const newTraceFlag = {
        TracedEntityId: TracedEntitySfId,
        DebugLevelId: debugLevel.Id,
        StartDate: new Date(Date.now() - 10 * MILLISECONDS_PER_MINUTE).toISOString(),
        logtype: 'USER_DEBUG',
        ExpirationDate: expirationDate.toISOString()
    }
    await conn.createRecord('TraceFlag', newTraceFlag);
    showTraceFlagStatus(tracedEntityType, newTraceFlag.ExpirationDate);
}

async function getTraceEntityId(conn, tracedEntityType) {
    let tracedEntity;
    if (tracedEntityType === 'User') {
        const userName = await conn.getUserName();
        tracedEntity = await findData(conn, 'User', {'Username': `${userName}`});
    } else if (tracedEntityType === 'Automated Process') {
        tracedEntity = await findData(conn, 'User', {'Name': 'Automated Process'});
    } else {
        tracedEntity = await findData(conn, 'User', {'Name': 'Platform Integration User'});
    }
    return tracedEntity.Id;
}

export async function deleteActiveTraceFlag(conn, TracedEntitySfId) {
    const currentTraceFlag = await getActiveTraceFlag(conn, TracedEntitySfId);
    if (currentTraceFlag) {
        await conn.deleteRecord(currentTraceFlag);
    }
}

async function getActiveTraceFlag(conn, TracedEntitySfId) {
    const NOW = new Date(Date.now()).toISOString();
    const traceFlags = await conn.query(`SELECT Id FROM TraceFlag WHERE TracedEntityId = '${TracedEntitySfId}' AND ExpirationDate >= ${NOW} ORDER BY ExpirationDate DESC LIMIT 1`, true);
    if (traceFlags || traceFlags.length > 0) {
        return traceFlags[0];
    } else {
        return null;
    }
}

export async function disableDebugLog(conn) {

    const tracedEntityType = await vscode.window.showQuickPick(TRACED_ENTITY_TYPES, { placeHolder: 'Select Traced Entity Type' });

    if (tracedEntityType) {
        const TracedEntitySfId = await getTraceEntityId(conn, tracedEntityType);

        await vscode.window.withProgress(
            {
                title: 'SPB: Delete Active Trace Flag',
                location: vscode.ProgressLocation.Notification
            },
            () => deleteActiveTraceFlag(conn, TracedEntitySfId)
        );
        hideTraceFlagStatus(tracedEntityType);
    }
}

export async function deleteApexLogs(conn) {
    const userChoise = await vscode.window.showQuickPick(['No', 'Yes'], { placeHolder: 'Are you sure you want to delete all the Apex Logs from the org?' })
    if (userChoise === 'Yes') {
        await vscode.window.withProgress(
            {
                title: 'Delete Apex Logs',
                location: vscode.ProgressLocation.Notification
            },
            () => deleteLogs(conn)
        );
    }
}

async function deleteLogs(conn) {
    let apexLogs = await conn.query(`SELECT Id FROM ApexLog ORDER BY LastModifiedDate ASC LIMIT 50000`, true);
    await conn.deleteRecords(apexLogs);
}
