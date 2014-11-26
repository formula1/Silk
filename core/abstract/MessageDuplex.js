var doAsync;
if(typeof module != "undefined" && module.exports){
  var MessageRouter = require(___dirname+"/MessageRouter.js");
  var MessageWriter = require(___dirname+"/MessageWriter.js");
  doAsync = process.nextTick.bind(process);
}else{
  doAsync = function(fn){
    setTimeout(fn,1);
  }
}

function MessageDuplex(writeFn, readFn){
  if(!readFn) readFn = writeFn;
  if(typeof writeFn == "undefined") throw new Error("Need at least 1 function");
  var _writeFn = writeFn;
  this.originator = Date.now()+"|"+Math.random();
  var that = this;
  writeFn = function(message){
    message.originator = that.originator
    _writeFn(message);
  };
  MessageRouter.call(this, readFn);
  MessageWriter.call(this, writeFn);
};
MessageDuplex.prototype = Object.create(MessageWriter.prototype);
MessageDuplex.prototype.add = MessageRouter.prototype.add;
MessageDuplex.prototype.routeMessage = MessageRouter.prototype.routeMessage;
MessageDuplex.prototype.processMessage = MessageRouter.prototype.processMessage;
MessageDuplex.prototype.handleMessage = function(message,user){
  console.log(message.originator);
  if(message.originator == this.originator){
    console.log("return");
    this.returnMessage(message);
  }else{
    console.log("route");
    this.routeMessage(message,user)
  }
};
MessageDuplex.prototype.constructor = MessageDuplex;
