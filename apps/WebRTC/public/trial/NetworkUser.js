function NetworkInstance(nethost){
  this.nethost = nethost;
  this.pconn = new RTCPeerConnection(nethost.config);
  this.pconn.onicecandidate = nethost.iceCB.bind(nethost);
  Object.defineProperty(this, "state", {
    get: function(){
      if(!this.pconn.localDescription)
        return "dormant",

    },
    set: function(){
      throw new Error("cannot set the state");
    }
  })
}
NetworkInstance.prototype = Object.create(EventEmitter);

NetworkInstance.prototype.offer = function(identity,cb){
  if(this.state != "dormant"){

  }
  this.channel = this.pconn.createDataChannel("sendDataChannel",nethost.sconfig);
  this.registerChannel(this.channel);
  var that = this;
  this.pconn.createOffer(function(desc){
    that.pconn.setLocalDescription(desc, function () {
      console.log(arguments);
      that.nethost.RTCHandle.send({
        cmd:"offer",
        identity:identity,
        desc:that.pconn.localDescription
      });
      cb(void(0),that);
    }, cb);
  }, cb);
}

NetworkInstance.prototype.registerChannel = function(channel){
  this.channel.onmessage = this.onMessage.bind(this);
  this.channel.onopen = this.emit.bind(this,"open");
  this.channel.onclose = this.emit.bind(this,"close");
}

NetworkInstance.prototype.accept = function(message,cb){
  var that = this;
  this.pconn.ondatachannel = function (event) {
      console.log('ondatachannel:', event.channel);
      that.registerChannel(event.channel);
  };
  this.pconn.setRemoteDescription(new RTCSessionDescription(message),function(){
    console.log(arguments);
    that.pconn.createAnswer(function(desc){
      that.pconn.setLocalDescription(desc, function () {
        console.log('sending local desc:', that.pconn.localDescription);
        this.nethost.RTCHandle.send({
          cmd:"accept",
          identity:message.identity,
          desc:that.pconn.localDescription
        });
        cb(void,that);
      }, cb);
    }, cb);
  },cb);
}

NetworkInstance.prototype.onMessage = function(event){
  var message = event.data;
  var user = event.user;
  try{
    message = JSON.parse(message);
  }catch(e){
    event.user.close();
  }
  console.log("Message: "+message);
  if(this.listeners(message.name).length == 0){
    return event.send(JSON.stringify({
      id:message.id,
      user:event.user.id,
      error:"method "+message.name+" does not exist"
    }));
  }
  message.user = user.id;
  switch(message.type){
    case "request":
      this.once(message.id,function(message){
        console.log(message);
        user.send(JSON.stringify(message));
      });
      break;
    case "pipe":
      var fn = function(message){
        user.send(JSON.stringify(message));
      }
      ClientEmitter.on(message.id,fn);
      user.on('close',function(){
        ClientEmitter.removeListener(message.id,fn);
      });
      break;
    case "unpipe":
      ClientEmitter.removeAllListeners(message.id);
      break;
    case "event": break;
    default:
      return user.send(JSON.stringify({
        id:message.id,
        user:user.id,
        error:"Bad message type "+message.type
      }));
  }
  this.emit(message.name,message);
}


NetworkHost.prototype.trigger = function(){

}

NetworkHost.prototype.get = function(){

}

NetworkHost.prototype.pipe = function(){

}

NetworkHost.prototype.unpipe = function(){

}

NetworkHost.prototype.add = function(){

}
