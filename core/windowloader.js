var fs = require("fs");
var url = require("url")
var express = require("express");
var domain = require('domain');
var applications = {};
var windows = []
var managers = [];

module.exports = function(app,wss){
  windows = compileWindows(__root+"/windows/",app);
  managers = compileWindows(__root+"/managers/",app);

  methods.add({
    "silk/apps/list": function (data) {
      console.log("test");
      console.log("received: " + data);
      return "this is a vlue returned by the method"
    }
  });

  app.get("/windows.json",function(req,res,next){
    res.type("json").send(windows);
  })
  app.get("/managers.json",function(req,res,next){
    res.type("json").send(managers);
  })

  app.get("/filesniffer",function(req,res,next){
    var d = domain.create();
    d.on('error', function(er) {
      return next(er);
    })
    d.run(function() {
      require(__dirname+"/filesniffer")(req.query.file,function(err,sniffed){
        if(err) return next(err);
        res.type("json").send(sniffed);
      });
    });
  })

}

function compileWindows(folder, app){
  if(!/\/$/.test(folder)) folder += "/";
  var list = [];
  fs.readdirSync(folder).forEach(function(file){
    if(!fs.existsSync(folder+file+"/window.json")){
      console.error(folder+file+"/window.json does not exist.");
       return;
    }
    try{
      var j = JSON.parse(fs.readFileSync(folder+file+"/window.json"))
    }catch(e){
      console.error(folder+file+"/window.json is a bad file");
      console.error(e.stack);
      return;
    }
    ["url","icon"].forEach(function(ns){
      j[ns] = url.resolve("/"+file+"/",j[ns]);
    })
    for(var i in [""])
    try{
      require.resolve(folder+file);
      try{
        require(folder+file);
      }catch(e){
        console.error(folder+file+" could not be loaded");
        console.error(e.stack);
        //Could implement logic to wait for user input unless --force
        return;
      }
    }catch(e){
      console.log(folder+file+" has no server files to require. Will still load.");
    }finally{
      list.push(j);
      app.use("/"+file, express.static(folder+file+"/public"));
    }
  })
  return list;
}
