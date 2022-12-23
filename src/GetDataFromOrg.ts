import { Connection } from './Connection';
import { asyncQuery, createFile } from './Utils';
import * as vscode from 'vscode';
const { readFile } = require("fs/promises");
import * as path from 'path'
import { cont } from './extension'

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
    const dataPath = vscode.Uri.file(path.join(cont.extensionPath, 'src', 'data.json'));
    return readFile(dataPath.fsPath).then( (dataJson) => {
        let metadata = JSON.parse(dataJson);
        let promiseList = [];
        metadata.data.forEach(data => {
            if(!dataType || data.Name == dataType){
                promiseList.push(new Promise<void>((resolve, reject) => {
                    asyncQuery(data.query, data.isRestApi)
                    .then((queryResult) => {
                        createFile(`${vscode.workspace.workspaceFolders[0].uri.fsPath}/.sfdx/tools/SPB/${Connection.getConnection().getOrgName()}/${data.fileName}.json`, JSON.stringify(queryResult), () => resolve());
                    })
                    .catch(err => {
                        reject(err)
                    })
                }))
            }
        })
        return Promise.all(promiseList);
    })
}