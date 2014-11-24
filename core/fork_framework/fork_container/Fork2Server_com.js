var path = require("path");

global.__root = path.resolve(__dirname,"../../../");
/*
  Similar to meteor.methods
*/
console.log("in the child");

var MessageObject = require(__root+"/core/public/requestinterface/MessageObject.js");

var methods = {};

// object of all methods
methods.list = {};
methods.users = {};

// function to add method to methods.list
methods.add = function (array) {

  for (var method in array) {
    methods.list[method] = array[method];
    process.send({cmd:"add",name:method});
  }

}

var User = require(__dirname+"/user_puppet.js");
process.on("message",function(message){
  if(!(message.user in methods.users))
    methods.users[message.user] = new User(message.user);
  message.user  = methods.users[message.user];
  if(!(message.name in methods.list))
    return console.log("methods list does not have "+message.name)
  if(!("cmd" in message)){
    var meth = new MessageObject(message, methods.list[message.name], function(message){
      process.send({cmd:"send",message:message});
    });
  }
  /*
  Commands:
    disconnect: Head is closed

  */
  switch(message.cmd){
    case "disconnect": message.user.emit("close"); break;
    case "close": break; //expected to close, will close forcfully in 5 seconds
    case "sleep": break; //Head is removed from the window manager so updates are impossible
    case "minimize": break; //Head is not removed but updates to the head will not be seen

  }
});

// make global because it will be used in most files.
global.methods = methods;


process.nextTick(function(){
  require(process.env.start);
})

process.send({cmd:"ready"});
