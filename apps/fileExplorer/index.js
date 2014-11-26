var fs = require('fs');
var mime = require("mime")
console.log("here");


function parsePath(path){
  var files = fs.readdirSync(path);
  for(var i=0;i<files.length;i++){
    files[i] = {
      name: files[i],
      path:path+files[i],
    }
    var stats = fs.statSync(files[i].path);
    files[i].isDir = stats.isDirectory();
    if(!files[i].isDir)
      files[i].mime = mime.lookup(files[i].path);
  }
  return files;
}

var watchers = {};

function setupWatcher(path,call_ob,next){
  if(call_ob.user.id in watchers){
    watchers[call_ob.user.id].close();
    console.log("closing watcher");
  }else{
    call_ob.user.on("disconnect", function(){
      closeWatcher(call_ob.user);
      delete watchers[call_ob.user.is];
    });
    call_ob.user.on("headless", function(){
      closeWatcher(call_ob.user);
    });
  }
  watchers[call_ob.user.id] = fs.watch(path, function (event, filename) {
    console.log('event is: ' + event);
    if (filename) {
      console.log('filename provided: ' + filename);
    } else {
      console.log('filename not provided');
    }
    next(void(0),parsePath(path));
  });
}

methods.add({
  "/list/path": function (path,call_ob,next) {
    console.log("recieved command");
    if(typeof path == "undefined")
      path = "/";
    else
      path = path;
    if(!/\/$/.test(path))
      path += "/";
    if(!fs.existsSync(path)){
      throw new Error("path:"+path+" doesn't exist")
    }
    if(!fs.statSync(path).isDirectory()){
      throw new Error("path:"+path+" is not a dirctory")
    }
    setupWatcher(path,call_ob,next);
    return parsePath(path);
  }
})
