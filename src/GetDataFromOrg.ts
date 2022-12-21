import { Connection } from './Connection';
import { asyncQuery, createFile } from './Utils';
import * as vscode from 'vscode';
import * as fs from 'fs';
const dataJson = {
    "data": [
        {
            "Name": "Flow",
            "definitions": [
                {
                    "query": "SELECT Id, DeveloperName FROM FlowDefinition",
                    "isRestApi": true,
                    "fileName": "flow"
                }
            ]
        },
        {
            "Name": "Profile",
            "definitions": [
                {
                    "query": "SELECT Id, Name FROM Profile",
                    "isRestApi": true,
                    "fileName": "profile"
                }
            ]
        }
    ]
};

export async function refreshMetadata() {
    try {
        await vscode.window.withProgress(
            {
            title: 'SPB: Get Data From Org',
            location: vscode.ProgressLocation.Notification
            },
            () => downloadMetadata('')
        );
    } catch (error) {
        console.log(error)
        vscode.window.showInformationMessage(error);
    }
}

export function downloadMetadata(dataType){
    let promiseList = [];
    dataJson.data.forEach(data => {
        if(!dataType || data.Name == dataType){
            data.definitions.forEach(definition => {
                promiseList.push(new Promise<void>((resolve, reject) => {
                    asyncQuery(definition.query, definition.isRestApi)
                    .then((queryResult) => {
                        createFile(`./.sfdx/tools/SPB/${Connection.getConnection().getOrgName()}/${definition.fileName}.json`, JSON.stringify(queryResult), () => resolve());
                    })
                }))
            })
        }
    })
    return Promise.all(promiseList);
}