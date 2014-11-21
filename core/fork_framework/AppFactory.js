
var util = require("util")
var fs = require("fs");
var events =  require("events");
var async = require("async");
var forkAssembler = require(__dirname+"/fork_container/forkAssembler.js")
var express = require("express");

module.exports = AppFactory;
function AppFactory(folder,urlpath,app){
  if(typeof folder == "undefined")
    throw Error("In Order to use the abstract, you need to provide a folder to load from");
  if(!/\/$/.test(folder)) folder += "/";
  if(!/\/$/.test(urlpath)) urlpath += "/"
  this.folder = folder;
  this.urlpath = urlpath;
  this.hashmap = {};
  this.clean = []
  this.removed = [];
  this.router = express.Router();
  this.router.get(urlpath,function(req,res,next){
    var t = url.parse(req.originalURL);
    t = t.substring(urlpath.length);
    t = t.substring(0,t.indexOf("/")||void(0));
    if(removed.indexOf(t) != -1)
      next(new Error("this application has been removed"))
    next();
  })
  var that = this;
  app.use(this.router)
  process.nextTick(this.compileFolder.bind(this));

  this.on("compiledSingle",function(j){
    that.router.use(urlpath+j.name, express.static(folder+j.name+"/public"));
    that.router.get(urlpath+j.name, function(req,res,next){
      res.redirect(301,j.url);
    });
    if(j.url != "headless");
      that.clean.push(j.clean);
    delete j.clean;
    that.hashmap[j.name] = j;
  });

  fs.watch(this.folder, this.fsEvent.bind(this));
}
util.inherits(AppFactory, events.EventEmitter);

AppFactory.prototype.compileFolder = function(app){
  var that = this;
  fs.readdir(this.folder, function(err,files){
    async.filterSeries(files,function(file,next){
      forkAssembler(that.folder,that.urlpath,file,function(err,j){
        if(err){
          console.log(file+" could not be loaded")
          console.log(err);
          return next(false)
        }
        that.emit("compiledSingle",j)
        next(true)
      })
    }, function(results){
      that.completed = results;
      that.emit("finishedCompiling", results);
    });
  })
}

AppFactory.prototype.fsEvent = function(event, filename){
  console.log(event);
}
AppFactory.prototype.closeSingle = function(window,next){
  if(!window.fork)
    return next(new Error("This window has no fork"))
  if(!window.fork.pid)
    return next(new Error("This fork is already gone"))
  try{
    window.fork.kill()
  }catch(e){
    return next(e)
  }
  next(void(0),window);
}

AppFactory.prototype.deleteSingle = function(window,next){
  fs.rmdir(window.path, function(err,res){
    console.log(JSON.stringify(arguments));
    if(err) next(err)
    next(void(0),window);
  });
}

AppFactory.prototype.hideSingle = function(window,next){
  var name = window.name;
  var i = 0;
  async.whilst(function(){
    return this.collection[i] && this.collection[i] != window
  }, function(next){ i++; process.nextTick(next)}, function(){
    if(!this.collection[i])
      next(new Error("there can't hide what doesn't exist"))
    delete this.collection[i];
    this.removed.push(name);
    next(void(0),window);
  })
}
