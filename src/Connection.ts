import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { asyncQuery } from './Utils';
import { resetStatusBar } from './StatusBar';
const execSync = require('child_process').execSync;
export class Connection {
    private orgName;
    private userName;
    private userId;
    private debugLevels;
    private automatedProcessUserId;
    private platformIntegrationUserId;
    private instanceUrl;
    public mapNameClass_MapMethodName_Coverage;
    public mapNameClass_TotalCoverage;

    private static instance;
    private static accessOrgs;

    private constructor(orgName) {
        this.orgName = orgName;
        let accessOrg = Connection.getAccessOrg(orgName);
        this.userName = accessOrg["username"];
        this.instanceUrl = accessOrg["instanceUrl"];
        resetStatusBar();
        this.mapNameClass_MapMethodName_Coverage = new Map();
        this.mapNameClass_TotalCoverage = new Map();
    }

    private static getAccessOrg(orgName) {
        let accessOrg;
        if (Connection.accessOrgs) {
            accessOrg = Connection.findAccessOrg(orgName);
            if (!accessOrg) {
                Connection.setAccessOrg();
                accessOrg = Connection.findAccessOrg(orgName);
            }
        } else {
            Connection.setAccessOrg();
            accessOrg = Connection.findAccessOrg(orgName);
        }
        return accessOrg;
    }

    private static setAccessOrg() {
        let response = execSync('sfdx force:auth:list --json');
        Connection.accessOrgs = JSON.parse(response.toString())["result"];
    }

    private static findAccessOrg(orgName) {
        return Connection.accessOrgs.find(accessOrg => {
            if (accessOrg.alias) {
                return accessOrg.alias.split(',').includes(orgName);
            }
            return false;
        })
    }

    public static getConnection() {
        let connectedOrg = Connection.getConnectedOrg();
        if (!this.instance || (connectedOrg != this.instance.getOrgName())) {
            this.instance = new Connection(connectedOrg);
        }
        return this.instance;
    }

    private static getConnectedOrg() {
        try {
            const sfdxConfigPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '/.sfdx', 'sfdx-config.json');
            const bodyConfig = fs.readFileSync(sfdxConfigPath, 'utf-8');
            const jsonConfig = JSON.parse(bodyConfig);
            return jsonConfig["defaultusername"];
        } catch (error) {
            vscode.window.showInformationMessage('You are not connected to any Salesforce org');
        }
    }

    public async getUserId() {
        if (!this.userId) {
            const user = await asyncQuery(`SELECT Id FROM User WHERE Username = '${this.userName}' LIMIT 1`, true);
            this.userId = user[0].Id
        }
        return this.userId;
    }

    public async getAutomatedProcessUserId() {
        if (!this.automatedProcessUserId) {
            const user = await asyncQuery(`SELECT Id FROM User WHERE Name = 'Automated Process' LIMIT 1`, true);
            this.automatedProcessUserId = user[0].Id
        }
        return this.automatedProcessUserId;
    }

    public async getPlatformIntegrationUserId() {
        if (!this.platformIntegrationUserId) {
            const user = await asyncQuery(`SELECT Id FROM User WHERE Name = 'Platform Integration User' LIMIT 1`, true);
            this.platformIntegrationUserId = user[0].Id
        }
        return this.platformIntegrationUserId;
    }

    public async getDebugLevels() {
        if (!this.debugLevels) {
            this.debugLevels = await asyncQuery('SELECT Id,DeveloperName FROM Debuglevel', true);
        }
        if (this.debugLevels.length > 0) {
            return this.debugLevels;
        } else {
            throw 'Retrivered Debug Levels failed';
        }
    }

    public getUsername() {
        return this.userName;
    }

    public getOrgName() {
        return this.orgName;
    }

    public getInstanceUrl() {
        return this.instanceUrl;
    }
}

