// connect to socket
function Server(host,port){
  port = 9999;
  this.queue = [];
  // method calls that are sent and waiting an answer
  this.sent = {};
  this.listeners = {};
  try {
    this.host = "ws://"+host+":"+port;
    console.log(this.host);
    this.socket = new WebSocket(this.host);
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onclose = this.onClose.bind(this);
  } catch (exception) {
    console.log('Error' + exception);
  }
}

Server.prototype.onOpen = function(){
  while(this.queue.length > 0){
    this.socket.send(this.queue.shift());
  }
}

Server.prototype.onMessage = function (message) {
  console.log(message);
  message = JSON.parse(message.data);
  console.log(message);
  if (typeof this.sent[message.id] == "undefined")
    throw new Error("non Existant Message");
  this.sent[message.id].callback(message.error, message.data);
  if(this.sent[message.id].type == "request")
    delete this.sent[message.id];
}

Server.prototype.onClose = function () {
  console.log('Socket Status: ' + this.socket.readyState + ' (Closed)');
}

Server.prototype.messageFactory = function(type,name,callback){
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
    try {
      this.socket.send(JSON.stringify(clone));
    } catch (e) {
      //if there is an error queue it for later when socket connects
      this.queue.push(JSON.stringify(clone));
    }
  }.bind(this);
  if(type == "event")
    return;
  this.sent[id] = jQuery.extend({}, content);;
  this.sent[id].callback = callback
  return this.sent[id];
}

Server.prototype.emit = function(name,data){
  Server.messageFactory("event",name,data);
}

// function to call server method
Server.prototype.get = function (name, data, cb) {
  // save callback so we can call it when receiving the reply
  var ret;
  if(typeof cb == "undefined"){
    ret = jQuery.Deferred();
    cb = function(err, message){
      if(err) return ret.fail(err);
      ret.resolve(message);
    }
  }
  this.messageFactory("request", name, cb).send(data);
  return (ret)?ret.promise():this;
}

Server.prototype.pipe = function(name, callback){
  var ret;
  var args = [];
  if(arguments.length > 2){
    args = Array.prototype.slice.call(arguments, 0);
    callback = args.pop();
    name = args.shift();
  }else if(arguments.length == 1){
    ret = jQuery.Deferred();
    callback = function(err,message){
      if(err) return ret.fail(err)
      ret.resolve(message)
    }
  }
  var p = this.messageFacotry("pipe", name);
  while(args.length > 0)
    p.send(args.shift());
  var pr = ret.promise();
  for(var i in p){
    pr[i] = p[i];
  }
  return pr;
}

Server.prototype.unpipe = function(ob){
  if(!ob)
    throw Error("cannot unpipe "+ob);
  var id = (ob.id)?ob.id:ob;
  if(this.send[id].type != "pipe")
    throw new Error("Would you like to abort a request?");
  delete this.sent[ob.id];
  return this;
}
var DocumentHost;
(function(url){
  console.log(url);

  url = /^http(s?):\/\/([0-9\.]+|[a-z\-.]+)((?::)[0-9]+)?(.*)$/.exec(url);
  console.log(url);
  DocumentHost = new Server(url[2],url[3].substring(1));
})(document.URL)
