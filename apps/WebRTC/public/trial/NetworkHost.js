function NetworkHost(url,config,info){
  if(!config){
    config = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
    console.log("Stun server should be same as document url");
  }
  this.config = config;
  if(!url) throw new Error("Cannot connect to nonexistant server");
  if(DocumentHost.url != url){
    url = /^http(s?):\/\/([0-9\.]+|[a-z\-.]+)((?::)[0-9]+)?(.*)$/.exec(url);
    this.RTCHost = new Server(url[2],url[3]||80);
  }else{
    this.RTCHost = DocumentHost;
  }
  this.connections = {};
  if(info){
    this.connectWith(info);
  }
  return this;
}

NetworkHost.prototype = Object.create(EventEmitter);

NetworkHost.prototype.connectWith = function(info, order){
  if(!info) throw new Error("Network Server may not be able to handle no information")
  this.info = info;
  this.RTCHandle = this.RTCHost.pipe("RTC-user",info,function(data){
    if(data.cmd == "offer")
      return this.emit("offer", data);
    if(data.cmd == "accept"){
      if(!this.connections[data.identity])
        return console.log("accepting a gift ungiven");
      this.connections[data.identity].handshake();
    }
  }.bind(this));
  this.RTCHost.pipe("RTC-order",{},function(data){
    if(data.cmd == "offer")
      return this.offer(data);
    if(data.cmd == "accept")
      return this.accept(data);
    if(data.cmd in order)
      return order[data.cmd](data);
  }.bind(this));
}

NetworkHost.userList = function(search){
  return this.RTCHost.get("RTC-list", search);
}

NetworkHost.prototype.closeAll = funciton(){
  for(var i in this.connections)
    this.connections[i].close();
}

NetworkHost.prototype.offer = function(identity){
  var def = jQuery.Deffered();
  this.connections[identity] = new NetworkInstance(this);
  this.connections[identity].offer(identity,function(err,cur){
    if(err) return def.reject(err);
    def.resolve(cur);
  });
  return def;
}

NetworkHost.prototype.offerAccept = function(message){
  var def = jQuery.Deffered();
  var identity = message.identity;
  this.connections[identity] = new NetworkInstance(this);
  this.connections[identity].accept(message.desc,function(err,cur){
    if(err) return def.reject(err);
    def.resolve(cur);
  });
  return def;
}

NetworkHost.prototype.accept = function(data){
  if(!this.connections[data.identity]){

  }
}

Share.prototype.public = function(){
  if (message.type === 'offer') {
      console.log('Got offer. Sending answer to peer.');
  } else if (message.type === 'answer') {
      console.log('Got answer.');
      peerConn.setRemoteDescription(new RTCSessionDescription(message), function(){}, logError);
  } else if (message.type === 'candidate') {
      peerConn.addIceCandidate(new RTCIceCandidate({candidate: message.candidate}));

  } else if (message === 'bye') {
      // TODO: cleanup RTC connection?
  }
}

Share.prototype.close = function(){

}
