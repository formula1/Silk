var url = require("url");
var child_process = require("child_process");
var http = require("http");
var https = require("https");
var fs = require("fs");
var async = require("async");


var windowreq = ["url","title","icon"];
var windowuri = ["url","icon"]

function forkAssembler(folder,urlpath,file,next){
  async.waterfall([
    function(next){
      next(void(0),folder,urlpath,file);
    },
    checkWindowJSON,
    checkURIs,
    checkNPMDeps,
    checkBowerDeps,
    createFork,
    forkListens
  ],function(err,result){
    if(err) return next(err);
    next(void(0),result)
  })
}
module.exports = forkAssembler;

function checkWindowJSON (folder,urlpath,file,next){
  var f = folder;
  fs.exists(f+file+"/window.json",function(boo){
    if(!boo)
      return next(new Error(f+file+"/window.json does not exist."));
    fs.readFile(f+file+"/window.json", function(err, contents){
      if(err) return next(err)
      try{
        var j = JSON.parse(contents);
      }catch(err){
        return next(err);
      }
      try{
        windowreq.forEach(function(item){
          if(!j[item]) throw new Error(item+" is required in "+file+"/window.json")
        })
      }catch(e){
        return next(e);
      }
      j.name = file;
      j.clean = JSON.parse(JSON.stringify(j));
      j.path = f+file;
      j.tempurl = urlpath+j.name;
      next(void(0),j);
    })
  })
}

function checkURIs (j,next){
  if(j.url === "headless") return next(void(0),j);
  async.each(windowuri,function(ns,next){
    j[ns] = url.resolve("http://localhost:3000"+j.tempurl+"/index.html",j[ns]);
    j.clean[ns] = j[ns];
    var parsed = url.parse(j[ns]);
    if(!url.host){
      fs.exists(j.path,function(boo){
        if(!boo) return next(new Error("local file does not exist"));
        next();
      })
      return;
    }
    if(/^https/.test(j[ns]))
      https.request(j[ns], function(res){
        if(res.statusCode >= 400)
          return next(new Error(j[ns]+" cannot be fulfilled "+res.statusCode));
      })
    else
      http.request(j[ns],function(res){
        if(res.statusCode >= 400)
          return next(new Error(j[ns]+" cannot be fulfilled "+res.statusCode));
      })
  },function(err){
    if(err) next(err);
    next(void(0),j);
  })
};

function checkNPMDeps (j,next){
  if(!j.npm_dependencies){
    j.npm_dependencies = {};
    j.npm_info = {already_install:[],new_install:[],all:[]};
    return next(void(0),j);
  }
  var ai = [];
  var ni = [];
  async.each(Object.keys(j.npm_dependencies),function(dep,next){
    try{
      var loc = require.resolve(dep);
      ai.push({name:dep,path:loc});
      return next(void(0),dep);
    }catch(e){
      console.log("this dependency does not exist");
      child_process.exec(
        "npm install "+dep+"@"+j.npm_dependencies[dep],
        {cwd:__root}, function(err,stout,sterr){
          if(err) return next(err);
          try{
            var loc = require.resolve(dep);
            ni.push({name:dep,path:loc});
            return next(void(0),dep);
          }catch(e){
            return next(e);
          }
      })
    }
  },function(err,results){
    if(err) return next(err);
    j.npm_info = {already_install:ai,new_install:ni,all:results};
    return next(void(0),j);
  })
};

function checkBowerDeps (j,next){
  if(!j.bower_dependencies){
    j.bower_dependencies = {};
    j.bower_info = {already_install:[],new_install:[],all:[]};
    return next(void(0),j);
  }
  var bowerJson = require('bower-json-auth');
  var ai = [];
  var ni = [];
  async.each(Object.keys(j.bower_dependencies),function(dep,next){
    bowerJson.read(__root+"/bower_components/"+dep,function(err,json){
      if(json){
         ai.push(dep)
         return next(void(0),dep);
      }
      child_process.exec(
      "bower install "+dep+"#"+j.bower_dependencies[dep],
      {cwd:__root}, function(err,stout,sterr){
        if(err) return next(err);
        console.log(stout);
        bowerJson.read(__root+"/bower_components/"+dep,function(err,file){
          if(err) return next(err);
          ni.push(dep);
          return next(void(0),dep);
        });
      })
    })
  },function(err,results){
    if(err) return next(err);
    j.bower_info = {already_install:ai,new_install:ni,all:results};
    return next(void(0),j);
  })
}

function createFork (j,next){
  try{
    require.resolve(j.path);
    try{
      var fork = child_process.fork(
        __dirname+"/Fork2Server_com.js",[],{
          cwd:__root,
        env:{
          start:j.path,
          TERM:process.env.TERM
        }
      });
      j.fork = fork;
      var timeout = setTimeout(function(){
        fork.removeAllListeners();
        fork.kill();
        return next(new Error(j.title+"'s fork process timed out, this may be due to long syncrounous code on initialization'"));
      }, 5000);

      fork.once("message",function(m){
        clearTimeout(timeout);
        fork.removeAllListeners();
        if(m.cmd != "ready"){
          fork.kill();
          return next(new Error("fork process sending messages before initialization"));
        }
        console.log("forkready");
        next(void(0),j);
      });
      fork.once("error",function(e){
        clearTimeout(timeout);
        fork.removeAllListeners();
        return next(e);
      });
    }catch(e){
      clearTimeout(timeout);
      fork.removeAllListeners();
      return next(e);
    }
  }catch(e){
    console.log(j.name+" has no serverside scripts but that is ok")
    return next(void(0),j);
  }
}

function forkListens(j,next){
  if(!j.fork) return next(void(0),j);
  var fork = j.fork;
  j.listeners = {};
  fork.on("message", function(m){
    switch(m.cmd){
      case "send": ClientEmitter.emit(m.message.id,m.message);break;
      case "add":
        j.listeners[m.name] = function(message){
          fork.send(message);
        };
        ClientEmitter.on(m.name,j.listeners[m.name]);
    }
  });
  fork.on("error",function(e){
    console.log(j.name+e);
  });
  fork.on("close",function(code,signal){
    for(var i in j.listeners){
      ClientEmitter.removeListener(i,j.listeners[i]);
    }
    delete j.listeners;
    ClientEmitter.emit("fork:disconnect",fork);
  })
  ClientEmitter.on("user:disconnect",function(){
    fork.send({cmd:"disconnect"});
  })
  next(void(0),j);
}
