var path = require("path");
global.__root = path.resolve(__dirname,"../../../");
var MessageRouter = require(__root+"/core/abstract/MessageRouter.js");
var ForkUser = require(__dirname+"/user_puppet.js");

var users = {};
var forkname = process.env.start.substring((__root+"/apps").length).split("/").splice(1,1)[0];
console.log("name: "+forkname);
/*
  Similar to meteor.methods
*/
console.log("in the child");

var methods = new MessageRouter(function(message){
  process.send({cmd:"send",message:message});
});

methods.on("add",function(key,fn){
  process.send({cmd:"add",key:key});
});

methods.on("remove",function(key,fn){
  process.send({cmd:"remove",key:key});
});

process.on("message",function(message){
  console.log(message.name);
  switch(message.cmd){
    case "disconnect": message.user.emit("close"); break;
    case "close": break; //expected to close, will close forcfully in 5 seconds
    case "sleep": break; //Head is removed from the window manager so updates are impossible
    case "minimize": break; //Head is not removed but updates to the head will not be seen
    default:
      if(!(message.user in users))
        users[message.user] = new ForkUser(message.user);
      message.user  = users[message.user];
      methods.routeMessage(message,message.user);
  }
});

// make global because it will be used in most files.
global.methods = methods;

process.nextTick(function(){
  require(process.env.start);
})

process.send({cmd:"ready"});