import * as path from 'path';
import * as vscode from 'vscode';
import { getOrgDetails } from './GetDataFromOrg';
import { resetStatusBar } from './StatusBar';
const fs = require('fs/promises');
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);
const writeFile = util.promisify(fs.writeFile);

export class Connection {
    private orgAlias;
    private orgDetail;
    public mapNameClass_MapMethodName_Coverage;
    public mapNameClass_TotalCoverage;

    private static instance;

    public constructor(orgAlias) {
        this.orgAlias = orgAlias;
        this.mapNameClass_MapMethodName_Coverage = new Map();
        this.mapNameClass_TotalCoverage = new Map();
        resetStatusBar();
    }

    public static async getConnection() {
        let connectedOrg = await Connection.getConnectedOrg();
        if (!this.instance || (connectedOrg != this.instance.getOrgAlias())) {
            this.instance = new Connection(connectedOrg);
        }
        return this.instance;
    }

    private static async getConnectedOrg() {
        try {
            let connectedOrg;
            const sfdxConfigPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '/.sfdx', 'sfdx-config.json');
            const configFile = await fs.readFile(sfdxConfigPath, 'utf-8');
            connectedOrg = JSON.parse(configFile)["defaultusername"];
            return connectedOrg;
        } catch (error) {
            throw 'SPB: You are not connected to any Salesforce org';
        }
    }

    public getOrgAlias() {
        return this.orgAlias;
    }

    public async getInstanceUrl() {
        if(!this.orgDetail){
            this.orgDetail = await getOrgDetails(this.getOrgAlias());
        }
        return this.orgDetail['instanceUrl'];
    }

    public async getUserName() {
        if(!this.orgDetail){
            this.orgDetail = await getOrgDetails(this.getOrgAlias());
        }
        return this.orgDetail['username'];
    }

    public async query(soql, isRestApi){
        const restApiCommand = isRestApi ? '-t' : '';
        let query = `sfdx force:data:soql:query -q "${soql}" ${restApiCommand} -u "${this.getOrgAlias()}" --json`;
        let queryResult = await execAsync(query, {maxBuffer: undefined});
        return JSON.parse(queryResult.stdout)["result"].records;
    }


    public async deleteRecords(SObjects){
        if(!SObjects || SObjects.length === 0) return;
        const objType = SObjects[0].attributes.type;
        const setIds = new Set(SObjects.map(object => object.Id));
        let csv = 'Id' + '\n';
        setIds.forEach(id => csv += id + '\n');
        const filePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,'tempDelete.csv');
        await writeFile(filePath, csv);
        await execAsync(`sfdx force:data:bulk:delete -s ${objType} -f ${filePath} -u "${this.getOrgAlias()}"`);
    }

    public async deleteRecord(SObject){
        const objType = SObject.attributes.type;
        await execAsync(`sfdx force:data:record:delete -t -s${objType} -i ${SObject.Id} -u "${this.getOrgAlias()}"`);
    }

    public async createRecord(objType, SObject){
        let values = '';
        for (let key in SObject) {
            values += (key + '=' + SObject[key] + ' ');
        }
        await execAsync(`sfdx force:data:record:create -t -s${objType} -v "${values}" -u "${this.getOrgAlias()}"`);
    }

    public async upsertRecord(objType, SObject){
        let values = '';
        let id;
        for (let key in SObject) {
            if(key != "Id"){
                values += (key + '=' + SObject[key] + ' ');
            }else{
                id = SObject[key];
            }
        }
        if(!id){
            await execAsync(`sfdx force:data:record:create -t -s${objType} -v "${values}" -u "${this.getOrgAlias()}"`);
        }else{
            await execAsync(`sfdx force:data:record:update -t -s${objType} -i ${id} -v "${values}" -u "${this.getOrgAlias()}"`);
        }
    }
}

