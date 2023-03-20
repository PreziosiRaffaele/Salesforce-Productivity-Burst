const fs = require('fs')
const util = require('util');
import * as path from 'path';
import * as vscode from 'vscode';
import {getDecorationForCoveredLines, getDecorationForUncoveredLines} from './Decorations';
var getDirName = require('path').dirname;
let decorationTypeCoveredLine;
let decorationTypeUncoveredLine;

/**
* @returns the opened Class Name
*/
export function getCurrentClassName(){
    const openedClass = vscode.window.activeTextEditor;
    if(!openedClass || isInvalidFile(openedClass)){
        throw 'Apex Class/Trigger not opened!';
    }
    const pathParsed = path.parse(openedClass.document.fileName);
    const className = pathParsed.base.split(".")[0];
    return className;
}

/**
* @returns if the opened File is an Apex Class
*/
export function isInvalidFile(openedClass) : Boolean{
    const pathClass = openedClass.document.fileName;
    let extension = pathClass.substring(pathClass.lastIndexOf("."));
    let validExtensions = new Set();
    validExtensions.add('.cls');
    validExtensions.add('.trigger');
    if(!pathClass || !validExtensions.has(extension)){
        return true;
    }else{
        return false;
    }
}

/**
* @returns The array of VsCode.range
*/
function getRange(lines) : Array<vscode.Range>{
    let coveredRange = [];
    const Max_VALUE = 1000;
    for(const line of lines){
        let range = new vscode.Range((line-1),0,(line-1),Max_VALUE);
        coveredRange.push(range);
    }
    return coveredRange;
}

export function highlightCoverage(coverageObject, openedClass){

    let coveredRange = getRange(coverageObject.coveredLines);
    let uncoveredRange = getRange(coverageObject.uncoveredLines);
    decorationTypeCoveredLine = getDecorationForCoveredLines();
    decorationTypeUncoveredLine = getDecorationForUncoveredLines();

    openedClass.setDecorations(decorationTypeCoveredLine, coveredRange);
    openedClass.setDecorations(decorationTypeUncoveredLine, uncoveredRange);
}

export function cleanCoverage(openedClass){
    if(decorationTypeCoveredLine != null && decorationTypeUncoveredLine != null){
        openedClass.setDecorations(decorationTypeCoveredLine, []);
        openedClass.setDecorations(decorationTypeUncoveredLine, []);
    }
}

export function isStandardField(apiName){
    return !(apiName.slice(-3) === '__c');
}

export function isStandardObject(apiName){
    return !(apiName.slice(-3) === '__c' || isCustomMetadata(apiName) || isPlatformEvent(apiName));
}

export function isCustomMetadata(apiName){
    return (apiName.slice(-5) === '__mdt');
}

export function isPlatformEvent(apiName){
    return (apiName.slice(-3) === '__e');
}

export function getObjectFieldDeveloperName(fileName){
    const fieldSplitted = fileName.split('__')
    if(fieldSplitted.length>2){
        return fieldSplitted[1]
    }else{
        return fieldSplitted[0]
    }
}

export function createFile(path, contents, cb) {
    fs.mkdir(getDirName(path), { recursive: true}, function (err) {
        if (err) return cb(err);
        fs.writeFile(path, contents, cb);
    });
}

export function isWindows(){
    return (process.platform === "win32")
}