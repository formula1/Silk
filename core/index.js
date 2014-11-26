var domain = require('domain');
var AF = require(__dirname+'/fork/AppFactory.js')
var filesniff = require(__dirname+"/utils/filesniffer");
var windows;
var jspath = require(__dirname+"/abstract/jspath-chain");
var express = require("express");
var fs = require("fs");


module.exports = function(app,wss){
  app.get('/', function (req, res) {
    res.sendFile(__dirname+'/utils/manager/public/index.html');
  })
  console.log("compiling forks");
  windows = new AF(__root+"/apps/","/",app);

  windows.on("finishedCompiling", function(results){
    for(var i in windows.hashmap)
      if(windows.hashmap[i].fork)
        windows.hashmap[i].fork.send({user:"Server",name:"windows",data:windows.clean});
    console.log("\nThese Windows were completed: "+ JSON.stringify(results));
  });
  windows.on("forked", function(fork){
    fork.on("error",function(err){
      console.log(fork.pid+e);
    });
    fork.on("close",function(code,signal){
      console.log("child is closed");
    });
    fork.on("disconnect",function(){
      console.log("child disconnected")
    })
  })
  console.log("setting up default publics");
  app.use("/abstract", express.static(__root+"/core/abstract"));
  ["fork","network","user","window"].forEach(function(folder){
    app.use("/"+folder, express.static(__root+"/core/"+folder+"/public"));
  })
  console.log("setting up utils publics");
  fs.readdirSync(__root+"/core/utils").forEach(function(folder){
    app.use("/utils/"+folder, express.static(__root+"/core/utils/"+folder+"/public"));
  })
  console.log("bower and browserify statics");
  app.get(/^\/bc\/.*/,require(__root+"/core/bower_static.js"));
  app.get(/^\/nm\/.*/,require(__root+"/core/browserify_static.js"));

  ClientEmitter.add("applications",function(message,callob,next){
    if(!message || !message.jspath){
      return windows.clean;
    }
    return jspath(message.jspath,windows.clean).get();
  })

  app.get("/filesniffer",function(req,res,next){
    var d = domain.create();
    d.on('error', function(er) {
      return next(er);
    })
    d.run(function() {
      filesniff(req.query.file,function(err,sniffed){
        if(err) return next(err);
        res.type("json").send(sniffed);
      });
    });
  })

}
