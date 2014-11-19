/*
  Similar to meteor.methods
*/

console.log("in the child");

var User = require(__dirname+"/user.js");

function MethodCall(message){
  this.id = message.id;
  this.user = message.user;
  this.name = message.name;
  this.data = message.data;
}

MethodCall.prototype.exec = function(){
  var that = this;
  try{
    var result = methods.list[this.name](this.data,this,function(e,result){
      if(e) return that.sendErr(e);
      if(result) return that.sendResult(result);
      console.log("no error, no result");
    });
  }catch(e){
    return this.sendErr(e)
  }
  if(typeof result != "undefined")
    this.sendResult(result);
}

MethodCall.prototype.sendErr = function (e){
  console.log(e.stack);
  var ms = JSON.parse(JSON.stringify(this));
  ms.error = e;
  ms.data = null;
  ms.user = ms.user.id;
  process.send({cmd:"send",message:ms});
}
MethodCall.prototype.sendResult = function (result){
  var ms = JSON.parse(JSON.stringify(this));
  ms.error = null;
  ms.data = result;
  ms.user = ms.user.id;
  process.send({cmd:"send",message:ms});
}


var methods = {};

// object of all methods
methods.list = {};
methods.users = {};

// function to add method to methods.list
methods.add = function (array) {
  for (var method in array) {
    process.send({cmd:"add",name:method});
    methods.list[method] = array[method];
  }
}

process.on("message",function(message){
  if(!(message.user in methods.users))
    methods.users[message.user] = new User(message.user);
  message.user  = methods.users[message.user];
  /*
  Commands:
    disconnect: Head is closed

  */
  if(!("cmd" in message)){
    var meth = new MethodCall(message);
    return meth.exec();
  }
  switch(message.cmd){
    case "disconnect": message.user.emit("disconnect"); break;
    case "close": break; //expected to close, will close forcfully in 5 seconds
    case "sleep": break; //Head is removed from the window manager so updates are impossible
    case "minimize": break; //Head is not removed but updates to the head will not be seen

  }
});
// execute method when called by client

// make global because it will be used in most files.
global.methods = methods;

require(process.env.start);
