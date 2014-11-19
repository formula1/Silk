var j = {"web-app": {
  "servlet": [
    {
      "servlet-name": "cofaxCDS",
      "servlet-class": "org.cofax.cds.CDSServlet",
      "init-param": {
        "configGlossary:installationAt": "Philadelphia, PA",
        "configGlossary:adminEmail": "ksm@pobox.com",
        "configGlossary:poweredBy": "Cofax",
        "configGlossary:poweredByIcon": "/images/cofax.gif",
        "configGlossary:staticPath": "/content/static",
        "templateProcessorClass": "org.cofax.WysiwygTemplate",
        "templateLoaderClass": "org.cofax.FilesTemplateLoader",
        "templatePath": "templates",
        "templateOverridePath": "",
        "defaultListTemplate": "listTemplate.htm",
        "defaultFileTemplate": "articleTemplate.htm",
        "useJSP": false,
        "jspListTemplate": "listTemplate.jsp",
        "jspFileTemplate": "articleTemplate.jsp",
        "cachePackageTagsTrack": 200,
        "cachePackageTagsStore": 200,
        "cachePackageTagsRefresh": 60,
        "cacheTemplatesTrack": 100,
        "cacheTemplatesStore": 50,
        "cacheTemplatesRefresh": 15,
        "cachePagesTrack": 200,
        "cachePagesStore": 100,
        "cachePagesRefresh": 10,
        "cachePagesDirtyRead": 10,
        "searchEngineListTemplate": "forSearchEnginesList.htm",
        "searchEngineFileTemplate": "forSearchEngines.htm",
        "searchEngineRobotsDb": "WEB-INF/robots.db",
        "useDataStore": true,
        "dataStoreClass": "org.cofax.SqlDataStore",
        "redirectionClass": "org.cofax.SqlRedirection",
        "dataStoreName": "cofax",
        "dataStoreDriver": "com.microsoft.jdbc.sqlserver.SQLServerDriver",
        "dataStoreUrl": "jdbc:microsoft:sqlserver://LOCALHOST:1433;DatabaseName=goon",
        "dataStoreUser": "sa",
        "dataStorePassword": "dataStoreTestQuery",
        "dataStoreTestQuery": "SET NOCOUNT ON;select test='test';",
        "dataStoreLogFile": "/usr/local/tomcat/logs/datastore.log",
        "dataStoreInitConns": 10,
        "dataStoreMaxConns": 100,
        "dataStoreConnUsageLimit": 100,
        "dataStoreLogLevel": "debug",
        "maxUrlLength": 500}},
    {
      "servlet-name": "cofaxEmail",
      "servlet-class": "org.cofax.cds.EmailServlet",
      "init-param": {
      "mailHost": "mail1",
      "mailHostOverride": "mail2"}},
    {
      "servlet-name": "cofaxAdmin",
      "servlet-class": "org.cofax.cds.AdminServlet"},

    {
      "servlet-name": "fileServlet",
      "servlet-class": "org.cofax.cds.FileServlet"},
    {
      "servlet-name": "cofaxTools",
      "servlet-class": "org.cofax.cms.CofaxToolsServlet",
      "init-param": {
        "templatePath": "toolstemplates/",
        "log": 1,
        "logLocation": "/usr/local/tomcat/logs/CofaxTools.log",
        "logMaxSize": "",
        "dataLog": 1,
        "dataLogLocation": "/usr/local/tomcat/logs/dataLog.log",
        "dataLogMaxSize": "",
        "removePageCache": "/content/admin/remove?cache=pages&id=",
        "removeTemplateCache": "/content/admin/remove?cache=templates&id=",
        "fileTransferFolder": "/usr/local/tomcat/webapps/content/fileTransferFolder",
        "lookInContext": 1,
        "adminGroupID": 4,
        "betaServer": true}}],
  "servlet-mapping": {
    "cofaxCDS": "/",
    "cofaxEmail": "/cofaxutil/aemail/*",
    "cofaxAdmin": "/admin/*",
    "fileServlet": "/static/*",
    "cofaxTools": "/tools/*"},

  "taglib": {
    "taglib-uri": "cofax.tld",
    "taglib-location": "/WEB-INF/tlds/cofax.tld"}}};


var jp = require("jspath");

var res = jp.apply("..{.servlet}", j, void(0),true);

console.log(res.toString());


function PathWrapper(path,subs,ctx){
  if(typeof ctx == "undefined"){
    ctx = subs;
    subs = void(0);
  }
  this.ctx = ctx;
  return this.prep(path,subs);
}

function anonymous(data,subst) {
var isArr = Array.isArray,res,v1,v2,v3,v4,v5,v6,v7,v8,v9,v10,v11,v12;isArr(data) || (data = [data]);res=data;v1=res.slice(),v8= [];while(v1.length) {v2=v1.shift();if(typeof v2!= null) {v3= [];if(isArr(v2)) {v4= 0,v7=v2.length;while(v4<v7) {v6=v2[v4++];if(v6!= null) {if(isArr(v6)) {v3=v3.concat(v6);}else {v3.length?v3.push(v6) :v3[0] =v6}}}}else {if(v2!= null) {if(isArr(v2)) {v8=v8.concat(v2);}else {v8.length?v8.push(v2) :v8[0] =v2}}if(typeof v2=== "object") {for(v5 in v2) {if(v2.hasOwnProperty(v5)) {v6=v2[v5];if(v6!= null) {if(isArr(v6)) {v3=v3.concat(v6);}else {v3.length?v3.push(v6) :v3[0] =v6}}}}}}v3.length &&v1.unshift.apply(v1,v3);}}res=v8;v8= [];v7= 0;v6=res.length;while(v7<v6) {v4=res[v7++];v5=[v4];v3= [],v2= 0,v1=v5.length,v12= [];while(v2<v1) {v9=v5[v2++];if(v9!= null) {v11=v9['servlet'];if(v11!= null) {if(isArr(v11)) {v1> 1?v12.length?v12.push(v11) :v12[0] =v11:v3=v3.concat(v11);}else {if(v12.length) {v3=v3.concat.apply(v3,v12);v12= [];}v3.length?v3.push(v11) :v3[0] =v11}}}}v5=v1> 1 &&v12.length?v12.length > 1?v3.concat.apply(v3,v12) :v3.concat(v12[0]) :v3;v5.length > 0&&v8.push(v4);}res=v8;return res;
}


findlocationofpath = new RegExp("^(\\{|,)"+path+":$"));


function viewpath(){

}

function inside(json,ancestor,path){
  var js = JSON.stringify(json);

  var rp = /[^\[\{\]\}]/ ;
  var l1 = new RegExp("^(?:\\{|,)\""+path+"\"(?:\:)$"); //findlocationofpath
  var l2 = new RegExp("^(?:\\{|,)"+ancestor+"(?:\:)$"); //findlocationofother
  // Return all pattern matches with captured groups
  var l1m = [];
  while ((match = l1.exec(js)) != null) {
    l1m.push(match);
  }
  var l2m = [];
  while ((match = l2.exec(js)) != null) {
    l2m.push(match);
  }
  var ret = [];
  var val1,val2;
  while(val1 = l1m.shift() && l2m.length > 0){
    L2Loop:
    var c = 0;
    while(l2m.length > c){
      if(val1.index < l2m[i].index){
        conntinue L1Loop; //THe ancestor is after the value, no point in looking further
      }
      var sub = js.substring(l2m[j].index,val1.index);
      var l = if(/\[|\{/g.exec(sub.pop()))
      var r = if(/\]|\}/g.exec(sub.pop()))
      if(r >= l){
        l2m.shift();
        continue L2Loop; //The ancestor is closed the next value wont work either
      }
      for()
      ret.push(val1);
      break;
    }
  }
}

function QualifyPath(substr){
  substr = substr.split("}");
  while(substr.length > 0){
    substr.splice(1,1);
    substr[0] = substring[0];
  }
}


PathWrapper.prototype.prep = function(path,subs){
  if(/undefined|object/.test(typeof subs))
    throw new Error("No Substitution is better than a non-Object Substitution")
  if(typeof path !== "string")
    throw new Error("If your path is not a string, there isn't a point to this")
  this.path = path;
  this.subs = subs;

  if(this.ctx)
    return this.apply(this.ctx);
  return this;
}

PathWrapper.prototype.apply = function(ctx){
  if(typeof ctx != "object")
    throw new Error("Cannot retrieve Values of a Non-Object");
  this.ctx = ctx;
  this.values = jspath(path,ctx,sctx)
  return this;
}

PathWrapper.prototype.delete = function(propertyname){
  if(typeof this.values == "undefined")
    throw new Error("Cannot delete what doesn't exist");
  for(var i in this.values){
    delete this.values[i][propertyname]
  }
  return this;
}

PathWrapper.prototype.set = function(propertyname, value){
  if(typeof this.values == "undefined")
    throw new Error("Cannot delete what doesn't exist");
  for(var i in this.values)
    this.values[i][propertyname] = value
  return this;
}

PathWrapper.prototype.get = function(){
  if(this.ctx == "undefined")
    throw new Error("Please .apply(JSONObject) before attempting to retrieve ")
  return this.values;
}
