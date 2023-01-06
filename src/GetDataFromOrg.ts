import { Connection } from './Connection';
import { asyncQuery, createFile, isStandardObject, getObjectFieldDeveloperName } from './Utils';
import * as vscode from 'vscode';
import { config } from './configData';
const { readFile } = require("fs/promises");

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
    config.forEach(data => {
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
}

export async function getData(metadataName, filters){
    let jsonData;
    let dataReloaded = false;
    const metadataConfig = config.filter(data => data.Name == metadataName)[0];
    const pathFile = `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.sfdx/tools/SPB/${Connection.getConnection().getOrgName()}/${metadataConfig.fileName}.json`;
    try{
        jsonData = await readFile(pathFile);
    }catch{
        await downloadMetadata(metadataName)
        dataReloaded = true;
        jsonData = await readFile(pathFile);
    }
    let data = JSON.parse(jsonData).filter(data => {
        for (let key in filters) {
            if (data[key] != filters[key]) {
                return false;
            }
        }
        return true;
    })
    if(data.length == 0 && !dataReloaded){
        await downloadMetadata(metadataName)
        jsonData = await readFile(pathFile);
        data = JSON.parse(jsonData).filter(data => {
            for (let key in filters) {
                if (data[key] != filters[key]) {
                    return false;
                }
            }
            return true;
        })
    }
    if(data.length == 0){
        throw "Metadata not found in the org";
    }else{
        return data;
    }
}

export async function getObjectId(objectName){
    if (isStandardObject(objectName)) {
        return objectName;
    } else {
        let objectDeveloperName = getObjectFieldDeveloperName(objectName);
        const objectData = await getData('Object', {'DeveloperName': objectDeveloperName})
        return objectData[0].Id
    }
}