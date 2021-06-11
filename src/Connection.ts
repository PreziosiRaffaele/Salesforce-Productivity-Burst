import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { query } from './Utils';
import { resetStatusBar } from './StatusBar';
const execSync = require('child_process').execSync;
export class Connection {
  private orgName;
  private userName;
  private userId;
  private debugLevels;
  public mapNameClass_MapMethodName_Coverage;
	public mapNameClass_TotalCoverage;
  private static instance;

  private constructor(orgName) {
    this.orgName = orgName;
    this.userName = setUsername(orgName);
    resetStatusBar();
    this.mapNameClass_MapMethodName_Coverage = new Map();
    this.mapNameClass_TotalCoverage = new Map();
  }

  public static getConnection() {
    let connectedOrg = getConnectedOrg();
    if(!this.instance || (connectedOrg != this.instance.getOrgName())){
      this.instance = new Connection(connectedOrg);
    }
    return this.instance;
  }

  public getUserId(){
    if(!this.userId){
      this.userId = query(`SELECT Id FROM User WHERE Username = '${this.userName}' LIMIT 1`)[0].Id;
    }
    return this.userId;
  }

  public getDebugLevels(){
    if(!this.debugLevels){
      this.debugLevels = query('SELECT Id,DeveloperName FROM Debuglevel');
    }
    return this.debugLevels;
  }

  public getUsername(){
    return this.userName;
  }

  public getOrgName(){
    return this.orgName;
  }
}

function setUsername(orgName) {
  let response = execSync('sfdx force:auth:list --json');
  let accessOrgs = JSON.parse(response.toString())["result"];
  let accessOrg = accessOrgs.find(accessOrg => accessOrg.alias == orgName)
  return accessOrg.username;
}

function getConnectedOrg() {
  try{
    const sfdxConfigPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,'/.sfdx','sfdx-config.json');
    const bodyConfig = fs.readFileSync(sfdxConfigPath, 'utf-8');
    const jsonConfig = JSON.parse(bodyConfig);
    return jsonConfig["defaultusername"];
  }catch(error){
    vscode.window.showInformationMessage('You are not connected to any Salesforce org');
  }
}

