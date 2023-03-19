import { createFile, isStandardObject, getObjectFieldDeveloperName } from './Utils';
import * as vscode from 'vscode';
import { config } from './configData';
const { readFile } = require("fs/promises");
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);

export async function refreshMetadata(conn) {
    try {
        await vscode.window.withProgress(
            {
                title: 'SPB: Get Data From Org',
                location: vscode.ProgressLocation.Notification
            },
            () => downloadMetadata(conn, '')
        );
    } catch (error) {
        console.log(error)
        vscode.window.showInformationMessage(error);
    }
}

export async function downloadMetadata(conn, dataType){
    let promiseList = [];
    const configs = await config(conn);
    configs.forEach(data => {
        if(!dataType || data.Name == dataType){
            promiseList.push(new Promise<void>((resolve, reject) => {
                conn.query(data.query, data.isRestApi)
                .then((queryResult) => {
                    createFile(`${vscode.workspace.workspaceFolders[0].uri.fsPath}/.sfdx/tools/SPB/${conn.getOrgAlias()}/${data.fileName}.json`, JSON.stringify(queryResult), () => resolve());
                })
                .catch(err => {
                    reject(err)
                })
            }))
        }
    })
    return Promise.all(promiseList);
}

export async function filterData(conn, metadataName, filters){
    let jsonData;
    let dataReloaded = false;
    const configs = await config(conn);
    const metadataConfig = configs.find(data => data.Name == metadataName);
    const pathFile = `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.sfdx/tools/SPB/${conn.getOrgAlias()}/${metadataConfig.fileName}.json`;
    try{
        jsonData = await readFile(pathFile);
    }catch{
        await downloadMetadata(conn, metadataName);
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
        await downloadMetadata(conn, metadataName);
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

export async function findData(conn, metadataName, filters){
    let jsonData;
    let dataReloaded = false;
    const configs = await config(conn);
    const metadataConfig = configs.find(data => data.Name == metadataName);
    const pathFile = `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.sfdx/tools/SPB/${conn.getOrgAlias()}/${metadataConfig.fileName}.json`;
    try{
        jsonData = await readFile(pathFile);
    }catch{
        await downloadMetadata(conn, metadataName)
        dataReloaded = true;
        jsonData = await readFile(pathFile);
    }
    let data = JSON.parse(jsonData).find(data => {
        for (let key in filters) {
            if (data[key] != filters[key]) {
                return false;
            }
        }
        return true;
    })
    if(!data && !dataReloaded){
        await downloadMetadata(conn, metadataName)
        jsonData = await readFile(pathFile);
        data = JSON.parse(jsonData).find(data => {
            for (let key in filters) {
                if (data[key] != filters[key]) {
                    return false;
                }
            }
            return true;
        })
    }
    if(!data){
        throw "Metadata not found in the org";
    }else{
        return data;
    }
}

export async function getObjectId(conn, objectName){
    if (isStandardObject(objectName)) {
        return objectName;
    } else {
        let objectDeveloperName = getObjectFieldDeveloperName(objectName);
        const objectData = await findData(conn, 'Object', {'DeveloperName': objectDeveloperName})
        return objectData.Id
    }
}

export async function getOrgDetails(orgName){
    const pathFile = `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.sfdx/tools/SPB/orgDetails.json`;
    let orgsDetails;
    let dataReloaded = false;
    try{
        orgsDetails = await readFile(pathFile);
    }catch{
        await downloadOrgDetails(pathFile);
        orgsDetails = await readFile(pathFile);
        dataReloaded = true;
    }

    let orgdetail = JSON.parse(orgsDetails).find((org) => {
        if(org.alias){
            return org.alias.split(',').includes(orgName);
        }else{//SCRATCH ORG WITHOUT ALIAS
            return org.username === orgName;
        }
    });

    if(!orgdetail && !dataReloaded){
        await downloadOrgDetails(pathFile);
        orgdetail = JSON.parse(orgsDetails).find((org) => {
            if(org.alias){
                return org.alias.split(',').includes(orgName);
            }else{//SCRATCH ORG WITHOUT ALIAS
                return org.username === orgName;
            }
        });
    }

    return orgdetail;
}

function downloadOrgDetails(pathFile){
    return new Promise<void>((resolve, reject) => {
        execAsync('sfdx force:auth:list --json')
            .then((results) => {
                const orglist = JSON.parse(results.stdout)["result"].map(({alias, username, instanceUrl}) => {
                    return {alias, username, instanceUrl};
                });
                createFile(pathFile, JSON.stringify(orglist), () => resolve());
            })
        }
    )
}
