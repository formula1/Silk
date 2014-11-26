var doAsync;
if(typeof module != "undefined" && module.exports){
  var EventEmitter = require("events").EventEmitter;
  doAsync = process.nextTick.bind(process);
}else{
  doAsync = function(fn){
    setTimeout(fn,1);
  }
}

function MessageRouter(SendBack){
  EventEmitter.call(this);
  if(!this.getListeners){
    this.getListeners = this.listeners.bind(this);
  }
  if(!SendBack)
    throw new Error("Need a manner to send back");
  this.on = this.addListener.bind(this);
  this.off = this.removeListener.bind(this);
  this.sendBack = SendBack;
}

MessageRouter.prototype = Object.create(EventEmitter.prototype);
MessageRouter.prototype.constructor = MessageRouter;



MessageRouter.prototype.add = function(m){
  if(!m) throw new Error("need either a Object(key:function), a key and function or a key");
  var that = this;
  var ob = {};
  var ret;
  if(arguments.length == 2){
    ob[arguments[0]] = arguments[1];
  }else{
    ob = m
  }

  Object.keys(ob).forEach(function(key){
    that.addListener(key,function(message){
      that.processMessage(message, ob[key]);
    });
    that.emit("add",key,ob[key]);
  });

}

MessageRouter.prototype.routeMessage = function(message,user){
  var that = this;

  if(this.getListeners(message.name).length == 0){
    message.data = null;
    message.error = "method "+message.name+" does not exist";
    return this.sendBack(message,user);
  }

  message.user = user;

  if(this.getListeners(message.id).length == 0)
    switch(message.type){
      case "request":
        this.once(message.id,function(message){
          that.sendBack(message,user);
        });
        break;
      case "pipe":
        var fn = function(message){
          that.sendBack(message,user);
        };
        this.on(message.id,fn);
        message.user.on('close',this.removeListener.bind(this,message.id,fn))
        break;
      case "abort":
        this.removeAllListeners(message.id);
        break;
      case "event": break;
      default:
        message.data = null;
        message.error = "Bad message type "+message.type;
        return this.sendBack(message,user);
    }
  doAsync(function(){
    that.emit(message.name,message);
  });
}

MessageRouter.prototype.processMessage = function(message,fn){
  var that = this;
  var next = function(err,result){
    message.error = (err)?err.stack:null;
    message.data =(err)?null:result;
    that.emit(message.id,message);
  };
  try{
    var result = fn(message.data,message,next);
  }catch(e){
    return next(e);
  }
  if(typeof result != "undefined")
    next(void(0),result);
}

if(typeof module != "undefined"){
  module.exports = MessageRouter;
}
