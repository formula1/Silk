function NetworkHost(url,info,config,sconfig){
  EventEmitter.call(this);
  this.on = this.addListener.bind(this);
  this.off = this.removeListener.bind(this);
  if(!config){
    config = {'iceServers': [
			{url: "stun:stun.l.google.com:19302"},
			{url: "stun:stun1.l.google.com:19302"},
			{url:	"stun:stun2.l.google.com:19302"},
			{url: "stun:stun3.l.google.com:19302"},
			{url: "stun:stun4.l.google.com:19302"},
			{url: "stun:stun01.sipphone.com"},
			{url: "stun:stun.ekiga.net"},
			{url: "stun:stun.fwdnet.net"},
			{ url: "stun:stun.ideasip.com"},
			{ url: "stun:stun.iptel.org" },
			{ url: "stun:stun.rixtelecom.se" },
			{ url: "stun:stun.schlund.de" },
			{ url: "stun:stunserver.org" },
			{ url: "stun:stun.softjoys.com" },
			{ url: "stun:stun.voiparound.com" },
			{ url: "stun:stun.voipbuster.com" },
			{ url: "stun:stun.voipstunt.com" },
			{ url: "stun:stun.voxgratia.org" },
			{ url: "stun:stun.xten.com" },
			{url: "stun:23.21.150.121"}
		]};
    console.log("Stun server should be same as document url");
  }
	if(!sconfig){
		sconfig = {reliable: false};
	}
  this.config = config;
  this.sconfig = sconfig;
  if(url && DocumentHost.url != url){
    url = /^http(s?):\/\/([0-9\.]+|[a-z\-.]+)((?::)[0-9]+)?(.*)$/.exec(url);
    this.RTCHost = new Server(url[2],url[3]||80);
  }else{
    this.RTCHost = DocumentHost;
  }
  this.connections = {};
  if(info){
    this.connect(info);
  }
  return this;
}
NetworkHost.prototype = Object.create(EventEmitter.prototype);
NetworkHost.prototype.constructor = NetworkHost;


NetworkHost.prototype.connect = function(info, order){
  if(!info) throw new Error("Network Server may not be able to handle no information")
  this.info = info;
  var that = this;
  this.RTCHandle = this.RTCHost.pipe("RTC-user",info,function(error,data){
    if(error) return alert(JSON.stringify(error));
    console.log(data);
    if(data.cmd == "offer")
      return that.emit("offer", data);
    if(data.cmd == "list"){
      console.log("list");
      return that.emit("userlist",data.data);
    }
    if(data.cmd == "accept"){
      console.log(data);
      if(!that.connections[data.identity])
        return console.log("accepting a gift ungiven");
			that.connections[data.identity].ok(data);
			return that.emit("handshake",that.connections[data.identity]);
    }
    if(data.cmd == "ice"){
			console.log("host ice");
			that.connections[data.identity].remoteIce(data.data);
    }
  });
}

NetworkHost.prototype.closeAll = function(){
  for(var i in this.connections)
    this.connections[i].close();
}

NetworkHost.prototype.offer = function(identity){
	var promise = new RSVP.Promise(function(resolve, reject){
		this.connections[identity] = new NetworkInstance(this, identity);
		this.connections[identity].offer(identity,function(err,cur){
		  if(err) return reject(err);
		  resolve(cur);
		});
	}.bind(this));
  return promise;
}

NetworkHost.prototype.offerAccept = function(message){
	var promise = new RSVP.Promise(function(resolve, reject){
		var identity = message.identity;
		this.connections[identity] = new NetworkInstance(this,identity);
		this.connections[identity].accept(message,function(err,cur){
		  if(err) return reject(err);
		  resolve(cur);
		});
  }.bind(this));
  return promise;
}
