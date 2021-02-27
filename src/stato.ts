export class Stato {
  public defaultOrg : String;
  public userName : String;
  public mapNameClass_MapMethodName_Coverage;
	public mapNameClass_TotalCoverage;

  constructor(defaultOrg : String){
    this.defaultOrg = defaultOrg;
    this.mapNameClass_MapMethodName_Coverage = new Map();
    this.mapNameClass_TotalCoverage = new Map();
  }
}