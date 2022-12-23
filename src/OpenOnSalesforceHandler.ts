import * as vscode from 'vscode';
import * as path from 'path';
import { asyncQuery, isStandardField, getObjectFieldDeveloperName, isCustomMetadata, isPlatformEvent } from './Utils';
import { Connection } from './Connection';
import { downloadMetadata } from './GetDataFromOrg'
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);
const { readFile } = require("fs/promises");
import { config } from './configData';

export async function openOnSaleforce(){
    try{
        const link = await vscode.window.withProgress(
            {
                title: 'SPB: Open On Salesforce',
                location: vscode.ProgressLocation.Notification
            },
            () => openLink()
            );
        }catch(error){
            console.log(error)
            vscode.window.showInformationMessage('It cannot be opened on Salesforce');
        }
    }

    async function openLink(){
        const openedFile = vscode.window.activeTextEditor;
        const pathParsed = path.parse(openedFile.document.fileName);
        const extension = getExtension(pathParsed.base)
        const metadata = new Factory().create(extension, pathParsed);
        const url = await metadata.getUrl();
        const completeUrl = `${Connection.getConnection().getInstanceUrl()}/${url}`;
        await execAsync(`start ${completeUrl}`);
    }

    function getExtension(pathParsedBase){
        const fileNameSplitted = pathParsedBase.split('.');

        if(fileNameSplitted.length > 2){
            return `${fileNameSplitted[fileNameSplitted.length - 2]}.${fileNameSplitted[fileNameSplitted.length - 1]}`
        }else{
            return fileNameSplitted[fileNameSplitted.length - 1];
        }
    }
    class Factory{

        create = (extension, pathParsed) => {
            if(!extension || !pathParsed) {
                throw 'It cannot be opened';
            }
            let metadata;
            if(extension === 'flow-meta.xml'){
                metadata = new Flow(extension, pathParsed);
            }else if(extension === 'field-meta.xml'){
                metadata = new Field(extension, pathParsed);
            }else if(extension === 'validationRule-meta.xml'){
                metadata = new ValidationRule(extension, pathParsed);
            }else if(extension === 'flexipage-meta.xml'){
                metadata = new FlexiPage(extension, pathParsed);
            }else if(extension === 'profile-meta.xml'){
                metadata = new Profile(extension, pathParsed);
            }else if(extension === 'permissionset-meta.xml'){
                metadata = new PermissionSet(extension, pathParsed);
            }else if(extension === 'permissionsetgroup-meta.xml'){
                metadata = new PermissionSetGroup(extension, pathParsed);
            }else if(extension === 'cls'){
                metadata = new ApexClass(extension, pathParsed);
            }else if(extension === 'trigger'){
                metadata = new ApexTrigger(extension, pathParsed);
            }else if(extension === 'recordType-meta.xml'){
                metadata = new RecordType(extension, pathParsed);
            }else if(extension === 'layout-meta.xml'){
                metadata = new PageLayout(extension, pathParsed);
            }else if(extension === 'object-meta.xml'){
                metadata = new SObject(extension, pathParsed);
            }else if(extension === 'md-meta.xml'){
                metadata = new CustomMetadata(extension, pathParsed);
            }else if(extension === 'globalValueSet-meta.xml'){
                metadata = new GlobalValueSet(extension, pathParsed);
            }

            return metadata;
        }
    }

    class Metadata{
        extension;
        pathParsed;
        metadataApiName;
        constructor(extension, pathParsed){
            this.extension = extension;
            this.pathParsed = pathParsed;
            this.metadataApiName = pathParsed.base.substring(0, ((pathParsed.base.length - (extension.length + 1))))
        }

        async getData(){
            let jsonData;
            let dataReloaded = false;
            const metadataName = this.constructor.name;
            const metadataConfig = config.filter(data => data.Name == metadataName)[0];
            const pathFile = `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.sfdx/tools/SPB/${Connection.getConnection().getOrgName()}/${metadataConfig.fileName}.json`;
            try{
                jsonData = await readFile(pathFile);
            }catch{
                await downloadMetadata(metadataName)
                dataReloaded = true;
                jsonData = await readFile(pathFile);
            }
            let data = JSON.parse(jsonData).filter(data => data[metadataConfig.key] == this.metadataApiName)[0]
            if(!data && !dataReloaded){
                await downloadMetadata(metadataName)
                jsonData = await readFile(pathFile);
                data = JSON.parse(jsonData).filter(data => data[metadataConfig.key] == this.metadataApiName)[0]
            }

            return data;
        }

        async getObjectId(){
            //TODO GET OBJECT ID
        }
    }

    class SObject extends Metadata{
        async getUrl(){
            const objectId = await Connection.getConnection().getObjectId(this.metadataApiName);
            if(isCustomMetadata(this.metadataApiName)){
                return `lightning/setup/CustomMetadata/page?address=%2F${objectId}%3Fsetupid%3DCustomMetadata`
            }else if(isPlatformEvent(this.metadataApiName)){
                return `lightning/setup/EventObjects/page?address=%2F${objectId}%3Fsetupid%3DEventObjects`
            }else{
                return `lightning/setup/ObjectManager/${objectId}/Details/view`
            }
        }
    }

    class GlobalValueSet extends Metadata{
        async getUrl(){
            const data = await this.getData();
            return `lightning/setup/Picklists/page?address=%2F${data.Id}`
        }
    }

    class CustomMetadata extends Metadata{
        async getUrl(){
            const splitObjectNameCmdName = this.metadataApiName.split('.');
            const objectName = splitObjectNameCmdName[0];
            const cmdRecordDeveloperName = splitObjectNameCmdName[1];

            const queryResult = await asyncQuery(`SELECT Id FROM ${objectName}__mdt WHERE DeveloperName = '${decodeURIComponent(cmdRecordDeveloperName)}'`, false);
            return `lightning/setup/CustomMetadata/page?address=%2F${queryResult[0].Id}`
        }
    }

    class PageLayout extends Metadata{
        async getUrl(){
            const splitObjectNameLayoutName = this.metadataApiName.split('-');
            const objectName = splitObjectNameLayoutName[0];
            const layoutName = splitObjectNameLayoutName[1];
            const objectId = await Connection.getConnection().getObjectId(objectName);
            const queryResult = await asyncQuery(`SELECT Id FROM Layout WHERE Name = '${decodeURIComponent(layoutName)}'`, true);
            return `lightning/setup/ObjectManager/${objectId}/PageLayouts/${queryResult[0].Id}/view`
        }
    }

    class RecordType extends Metadata{
        async getUrl(){
            const queryResult = await asyncQuery(`SELECT Id FROM RecordType WHERE DeveloperName = '${this.metadataApiName}'`, false);
            const arrayPath = this.pathParsed.dir.split(path.sep);
            let objectFolderName = arrayPath[arrayPath.length - 2];
            const objectId = await Connection.getConnection().getObjectId(objectFolderName);
            return `lightning/setup/ObjectManager/${objectId}/RecordTypes/${queryResult[0].Id}/view`
        }
    }

    class Flow extends Metadata{
        async getUrl(){
            const data = await this.getData();
            return `lightning/setup/Flows/page?address=%2F${data.Id}`
        }
    }

    class ValidationRule extends Metadata{
        async getUrl(){
            const data = await this.getData();
            return `lightning/setup/ObjectManager/${data.EntityDefinitionId}/ValidationRules/${data.Id}/view`;
        }
    }

    class FlexiPage extends Metadata{
        async getUrl(){
            const data = await this.getData();
            return `visualEditor/appBuilder.app?id=${data.Id}`
        }
    }

    class Profile extends Metadata{
        async getUrl(){
            const data = await this.getData();
            return `lightning/setup/EnhancedProfiles/page?address=%2F${data.Id}`
        }
    }

    class PermissionSet extends Metadata{
        async getUrl(){
            const data = await this.getData();
            return `lightning/setup/PermSets/page?address=%2F${data.Id}`
        }
    }

    class PermissionSetGroup extends Metadata{
        async getUrl(){
            const data = await this.getData();
            return `lightning/setup/PermSetGroups/page?address=%2F${data.Id}`
        }
    }

    class ApexClass extends Metadata{
        async getUrl(){
            const data = await this.getData();
            return `lightning/setup/ApexClasses/page?address=%2F${data.Id}`
        }
    }

    class ApexTrigger extends Metadata{
        async getUrl(){
            const data = await this.getData();
            return `lightning/setup/ApexTriggers/page?address=%2F${data.Id}`
        }
    }

    class Field extends Metadata{
        async getUrl(){
            let url;

            const arrayPath = this.pathParsed.dir.split(path.sep);
            let objectFolderName = arrayPath[arrayPath.length - 2];
            if(isStandardField(this.metadataApiName)){ //Per i campi e gli oggetti standard posso utilizzare come Id il developerName
                if(this.metadataApiName.slice(-2) === 'Id'){
                    this.metadataApiName = this.metadataApiName.substring(0,this.metadataApiName.length-2);
                }
                url = `lightning/setup/ObjectManager/${objectFolderName}/FieldsAndRelationships/${this.metadataApiName}/view`;
            }else{
                this.metadataApiName = getObjectFieldDeveloperName(this.metadataApiName);
                const objectId = await Connection.getConnection().getObjectId(objectFolderName);
                const queryResult = await asyncQuery(`SELECT Id FROM CustomField WHERE DeveloperName = '${this.metadataApiName}' AND TableEnumOrId = '${objectId}'`, true);
                if(isCustomMetadata(objectFolderName)){
                    url = `lightning/setup/CustomMetadata/page?address=%2F${queryResult[0].Id}%3Fsetupid%3DCustomMetadata`;
                }else if(isPlatformEvent(objectFolderName)){
                    url = `lightning/setup/EventObjects/page?address=%2F${queryResult[0].Id}%3Fsetupid%3DEventObjects`;
                }else{
                    url = `lightning/setup/ObjectManager/${objectId}/FieldsAndRelationships/${queryResult[0].Id}/view`;
                }
            }

            return url;
        }
    }
