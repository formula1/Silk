var domain = require('domain');
var AF = require(__dirname+'/fork_framework/AppFactory.js')
var filesniff = require(__dirname+"/utils/filesniffer");
var windows;
var jspath = require(__dirname+"/utils/jspath-chain");

module.exports = function(app,wss){
  app.get("/bc/:component",require(__root+"/core/bower_static.js"));
  app.get("/nm/:module",require(__root+"/core/browserify_static.js"));

  windows = new AF(__root+"/apps/","/",app);
  windows.on("finishedCompiling", function(results){
    for(var i in windows.hashmap)
      if(windows.hashmap[i].fork)
        windows.hashmap[i].fork.send({name:"windows",data:windows.clean});
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
  ClientEmitter.on("applications",function(message){
    if(!message.data || !message.data.jspath){
      message.data = windows.clean;
      return ClientEmitter.emit(message.id,message);
    }
    try{
      console.log(windows.clean);
      message.data = jspath(message.data.jspath,windows.clean).get();
    }catch(e){
      message.data = null;
      message.error = e.toString;
    } finally{
      ClientEmitter.emit(message.id,message);
    }

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
