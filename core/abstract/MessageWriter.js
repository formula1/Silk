var doAsync;
if(typeof module != "undefined"){
	var RSVP = require("rsvp");
	var StreamPromise = require(__dirname+"/StreamPromise.js");
	var EventEmitter = require("events").EventEmitter;
	doAsync = process.nextTick.bind(process);
}else{
	doAsync = function(fn){
		setTimeout(fn,1);
	};
}

function MessageWriter(sendfn){
  EventEmitter.call(this);
  this.on = this.addListener.bind(this);
  this.off = this.removeListener.bind(this);
	if(typeof this.getListeners == "undefined"){
		this.getListeners = this.listeners.bind(this);
	}
	this.sendfn = sendfn;
  this.queue = [];
	this.ready = false;
  // method calls that are sent and waiting an answer
}

MessageWriter.prototype = Object.create(EventEmitter.prototype);
MessageWriter.prototype.constructor = MessageWriter;


MessageWriter.prototype.onClose = function () {
  console.log('Socket Status: ' + this.socket.readyState + ' (Closed)');
}

MessageWriter.prototype.onReady = function(){
	this.ready = true;
  while(this.queue.length > 0){
    this.sendfn(this.queue.shift());
  }
}

MessageWriter.prototype.onNotReady = function(){
	this.ready = false;
}

MessageWriter.prototype.returnMessage = function (message) {
	console.log(message)
  if (this.getListeners(message.id).length == 0)
    throw new Error("non Existant Message");
  this.emit(message.id, message.error,message.data);
}


MessageWriter.prototype.trigger = function(name,data){
  this.messageFactory("event",name).send(data);
}

// function to call server method
MessageWriter.prototype.get = function (name, data, cb) {
  // save callback so we can call it when receiving the reply

  var ret;
  if(typeof cb == "undefined"){
    ret = RSVP.defer();
		ret.promise.done = ret.promise.then.bind(ret.promise);
    cb = function(err, message){
      if(err) return ret.reject(err);
      ret.resolve(message);
    }
  }
  this.messageFactory("request", name, cb).send(data);
  return (ret)?ret.promise:this;
}

MessageWriter.prototype.pipe = function(name, callback){
  var ret;
  var args = [];
  if(arguments.length > 2){
    args = Array.prototype.slice.call(arguments, 0);
    callback = args.pop();
    name = args.shift();
  }else if(arguments.length == 1){
    ret = new StreamPromise();
    callback = ret._write.bind(ret);
  }
  var p = this.messageFactory("pipe", name, callback);
  while(args.length > 0)
    p.send(args.shift());
  if(ret){
    ret.inherit(p.send.bind(p));
    return ret;
  }
  return p;
}

MessageWriter.prototype.abort = function(ob){
  if(!ob)
    throw Error("cannot unpipe "+ob);
  var id = (ob.id)?ob.id:ob;
  if(this.listeners(id).length == 0)
    throw new Error("Cannot abort what doesn't exist");
	this.removeAllListeners(id);
  return this;
}


MessageWriter.prototype.messageFactory = function(type,name,callback){
  //id to find callback when returned data is received
  var id = Date.now() + "-" + Math.random();
  var content = {
    id: id,
    name: name,
    type: type,
  };
  content.send = function(data){
    var clone = JSON.parse(JSON.stringify(content));
    clone.data = data;
		if(this.ready){
      this.sendfn(clone);
		}else{
      //if there is an error queue it for later when socket connects
      this.queue.push(clone);
    }
  }.bind(this);
  if(type == "event")
    return content;
  if(type == "request")
		this.once(id,callback);
	if(type == "pipe")
		this.addListener(id,callback);
  return content;
}

if(typeof module != "undefined"){
	module.exports = MessageWriter;
}
