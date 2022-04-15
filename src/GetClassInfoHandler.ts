import {getCurrentClassName,asyncQuery} from './Utils';
import * as vscode from 'vscode';

export async function runClassInfo(){
  try{
    const classInfo = await vscode.window.withProgress(
      {
        title: 'SPB: Get Apex Info',
        location: vscode.ProgressLocation.Notification
      },
      () => getClassInfo()
    );
    vscode.window.showInformationMessage(`Class Name: ${classInfo[0].Name}, Created By: ${classInfo[0].CreatedBy.Name}, Created Date:  ${classInfo[0].CreatedDate},
    Last Modified By:  ${classInfo[0].LastModifiedBy.Name}, Last Modified Date:  ${classInfo[0].LastModifiedDate}`);
  }catch(error){
    vscode.window.showInformationMessage(error);
  }
}

async function getClassInfo(){
  const className = getCurrentClassName();
  const classInfo = await asyncQuery( 'SELECT Name, CreatedBy.Name,LastModifiedBy.Name, FORMAT(CreatedDate), FORMAT(LastModifiedDate) '
                          + 'FROM ApexClass '
                          + 'WHERE Name = \'' + className + '\'');
  if(classInfo.length > 0){
    return classInfo;
  }else{
    throw 'Apex Class/Trigger not founded'
  }
}