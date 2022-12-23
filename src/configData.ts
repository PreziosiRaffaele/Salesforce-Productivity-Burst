export let config = [
        {
            "Name": "Flow",
            "query": "SELECT Id, DeveloperName FROM FlowDefinition",
            "isRestApi": true,
            "fileName": "flow",
            "key": "DeveloperName"
        },
        {
            "Name": "Profile",
            "query": "SELECT Id, Name FROM Profile",
            "isRestApi": true,
            "fileName": "profile",
            "key": "Name"
        },
        {
            "Name": "GlobalValueSet",
            "query": "SELECT Id, DeveloperName FROM GlobalValueSet",
            "isRestApi": true,
            "fileName": "globalValueSet",
            "key": "DeveloperName"
        },
        {
            "Name": "FlexiPage",
            "query": "SELECT Id, DeveloperName FROM FlexiPage",
            "isRestApi": true,
            "fileName": "flexiPage",
            "key": "DeveloperName"
        },
        {
            "Name": "PermissionSet",
            "query": "SELECT Id, Name FROM PermissionSet",
            "isRestApi": true,
            "fileName": "permissionSet",
            "key": "Name"
        },
        {
            "Name": "PermissionSetGroup",
            "query": "SELECT Id, DeveloperName FROM PermissionSetGroup",
            "isRestApi": true,
            "fileName": "permissionSetGroup",
            "key": "DeveloperName"
        },
        {
            "Name": "ApexClass",
            "query": "SELECT Id, Name FROM ApexClass",
            "isRestApi": true,
            "fileName": "apexClass",
            "key": "Name"
        },
        {
            "Name": "ApexTrigger",
            "query": "SELECT Id, Name FROM ApexTrigger",
            "isRestApi": true,
            "fileName": "apexTrigger",
            "key": "Name"
        },
        {
            "Name": "ValidationRule",
            "query": "SELECT Id, ValidationName, EntityDefinitionId FROM ValidationRule",
            "isRestApi": true,
            "fileName": "validationRule",
            "key": "ValidationName"
        },
        {
            "Name": "Object",
            "query": "Select Id,DeveloperName from CustomObject",
            "isRestApi": true,
            "fileName": "object",
            "key": "DeveloperName"
        },
        {
            "Name": "PageLayout",
            "query": "SELECT Id, Name FROM Layout",
            "isRestApi": true,
            "fileName": "pageLayout",
            "key": "Name"
        },
        {
            "Name": "RecordType",
            "query": "SELECT Id, DeveloperName FROM RecordType",
            "isRestApi": false,
            "fileName": "recordType",
            "key": "DeveloperName"
        },
        {
            "Name": "Field",
            "query": "SELECT Id, DeveloperName, TableEnumOrId FROM CustomField",
            "isRestApi": true,
            "fileName": "field",
            "key": "DeveloperName"
        }
    ]