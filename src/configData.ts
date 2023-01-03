export let config = [
        {
            "Name": "Flow",
            "query": "SELECT Id, DeveloperName FROM FlowDefinition",
            "isRestApi": true,
            "fileName": "flow"
        },
        {
            "Name": "Profile",
            "query": "SELECT Id, Name FROM Profile",
            "isRestApi": true,
            "fileName": "profile"
        },
        {
            "Name": "GlobalValueSet",
            "query": "SELECT Id, DeveloperName FROM GlobalValueSet",
            "isRestApi": true,
            "fileName": "globalValueSet"
        },
        {
            "Name": "FlexiPage",
            "query": "SELECT Id, DeveloperName FROM FlexiPage",
            "isRestApi": true,
            "fileName": "flexiPage"
        },
        {
            "Name": "PermissionSet",
            "query": "SELECT Id, Name FROM PermissionSet",
            "isRestApi": true,
            "fileName": "permissionSet"
        },
        {
            "Name": "PermissionSetGroup",
            "query": "SELECT Id, DeveloperName FROM PermissionSetGroup",
            "isRestApi": true,
            "fileName": "permissionSetGroup"
        },
        {
            "Name": "ApexClass",
            "query": "SELECT Id, Name FROM ApexClass",
            "isRestApi": true,
            "fileName": "apexClass"
        },
        {
            "Name": "ApexTrigger",
            "query": "SELECT Id, Name FROM ApexTrigger",
            "isRestApi": true,
            "fileName": "apexTrigger"
        },
        {
            "Name": "ValidationRule",
            "query": "SELECT Id, ValidationName, EntityDefinitionId FROM ValidationRule",
            "isRestApi": true,
            "fileName": "validationRule"
        },
        {
            "Name": "Object",
            "query": "Select Id,DeveloperName from CustomObject",
            "isRestApi": true,
            "fileName": "object"
        },
        {
            "Name": "PageLayout",
            "query": "SELECT Id, Name FROM Layout",
            "isRestApi": true,
            "fileName": "pageLayout"
        },
        {
            "Name": "RecordType",
            "query": "SELECT Id, DeveloperName FROM RecordType",
            "isRestApi": false,
            "fileName": "recordType"
        },
        {
            "Name": "Field",
            "query": "SELECT Id, DeveloperName, TableEnumOrId FROM CustomField",
            "isRestApi": true,
            "fileName": "field"
        },
        {
            "Name": "QuickAction",
            "query": "select Id, DeveloperName from QuickActionDefinition",
            "isRestApi": true,
            "fileName": "quickAction"
        }
    ]