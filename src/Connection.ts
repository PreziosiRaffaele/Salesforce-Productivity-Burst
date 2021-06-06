
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
const execSync = require('child_process').execSync;

export class Connection {
  public orgName;
  public userName;
  public mapNameClass_MapMethodName_Coverage;
	public mapNameClass_TotalCoverage;
  private static instance;

  private constructor(orgName){
    this.orgName = orgName;
    this.userName = getUsername(orgName);
    this.mapNameClass_MapMethodName_Coverage = new Map();
    this.mapNameClass_TotalCoverage = new Map();
  }

  static getInstance(){
    let currentOrg = getCurrentOrg();
    if(!this.instance || (currentOrg != this.instance.orgName)){
      this.instance = new Connection(currentOrg);
    }
    return this.instance;
  }
}

function getUsername(orgName){
  let response = execSync('sfdx force:auth:list --json');
  let accessOrgs = JSON.parse(response.toString())["result"];
  let accessOrg = accessOrgs.find(accessOrg => accessOrg.alias == orgName)
  return accessOrg.username;
}

function getCurrentOrg() {
  try{
    const sfdxConfigPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,'/.sfdx','sfdx-config.json');
    const bodyConfig = fs.readFileSync(sfdxConfigPath, 'utf-8');
    const jsonConfig = JSON.parse(bodyConfig);
    return jsonConfig["defaultusername"];
  }catch(error){
    vscode.window.showInformationMessage('You are not connected to any Salesforce org');
  }
}

