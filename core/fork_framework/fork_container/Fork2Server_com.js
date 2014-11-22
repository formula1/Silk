/*
  Similar to meteor.methods
*/
console.log("in the child");

function MethodCall(message){
  this.id = message.id;
  this.user = message.user;
  this.name = message.name;
  this.data = message.data;
  this.exec();
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
  if(result != "undefined")
    this.sendResult(result);
}

MethodCall.prototype.sendErr = function (e){
  process.send({cmd:"send",message:{
    id: this.id,
    user: this.user.id,
    error: e.stack,
    data: null
  }});
}
MethodCall.prototype.sendResult = function (result){
  process.send({cmd:"send",message:{
    id: this.id,
    user: this.user.id,
    error: null,
    data: result,
  }});
}


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

// execute method when called by client
methods.call = function(user,message){
  try{
    var meth = new MethodCall(user,message);
  }catch(e){
    return console.log("error: "+e+", message: "+ JSON.stringify(message));
  }
  meth.exec();
}
var User = require(__dirname+"/user_puppet.js");
process.on("message",function(message){
  console.log(message.user);
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
