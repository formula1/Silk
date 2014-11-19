var fs = require("fs");
var url = require("url")
var subdomain = require('express-subdomain');
var express = require("express");
var domain = require('domain');
var WL = require(__dirname+'/packageloader/abstractloader.js')
var applications = {};
var windows;
var managers;

module.exports = function(app,wss){
  windows = new WL(__root+"/windows/","/",app);
  windows.on("finishedCompiling", function(results){
    console.log("\nThese Windows were completed: "+ JSON.stringify(results));
  });
  managers = new WL(__root+"/managers/","/wm",app);
  managers.on("finishedCompiling", function(results){
    console.log("\nThese Managers were completed: "+ JSON.stringify(results));
  });

  app.get("/windows.json",function(req,res,next){
    console.log(windows.clean);
    res.type("json").send(windows.clean);
  })

  app.get("/managers.json",function(req,res,next){
    console.log(managers.clean);
    res.type("json").send(managers.clean);
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
