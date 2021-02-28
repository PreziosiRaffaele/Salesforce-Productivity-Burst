export class Stato {
  public defaultOrg : String;
  public userName : String;
  public mapNameClass_MapMethodName_Coverage;
	public mapNameClass_TotalCoverage;
  private static instance;

  private constructor(defaultOrg : String){
    this.defaultOrg = defaultOrg;
    this.mapNameClass_MapMethodName_Coverage = new Map();
    this.mapNameClass_TotalCoverage = new Map();
  }

  static getInstance(orgName){
    if(!this.instance){
      this.instance = new Stato(orgName);
    }
    return this.instance;
  }

  static reset(orgName){
    this.instance.defaultOrg = orgName;
    this.instance.userName = null;
    this.instance.mapNameClass_MapMethodName_Coverage = new Map();
    this.instance.mapNameClass_TotalCoverage = new Map();
  }
}