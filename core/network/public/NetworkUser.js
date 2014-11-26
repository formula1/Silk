function NetworkInstance(nethost, identity){
  MessageDuplex.call(this, function(message){
		message.identity = this.identity;
    this.channel.send(message);
	}.bind(this));
	this.identity = identity;
  this.nethost = nethost;
  this.pconn = new RTCPeerConnection(nethost.config,{
    optional: [
        {DtlsSrtpKeyAgreement: true},
        {RtpDataChannels: true}
    ]
	});
  this.pconn.onicecandidate = this.iceCB.bind(this);
  Object.defineProperty(this, "state", {
    get: function(){
      if(!this.pconn.localDescription)
        return "dormant";
    },
    set: function(){
      throw new Error("cannot set the state");
    }
  })
}
NetworkInstance.prototype = Object.create(MessageWriter.prototype);
NetworkInstance.prototype.constructor = NetworkInstance;

NetworkInstance.prototype.offer = function(identity,cb){
	this.identity = identity;
  this.registerChannel(this.pconn.createDataChannel("sendDataChannel",this.nethost.sconfig));
  var that = this;
  this.pconn.createOffer(function(desc){
    that.pconn.setLocalDescription(desc, function () {
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
	var that = this;
	this.channel = channel;
  this.channel.onmessage = function(event){
		try{
		  var message = JSON.parse(event.data);
		}catch(e){
		  event.target.close();
			return;
		}
    that.handleMessage(message,event.target);
	};
	this.channel.onopen = function(){
    that.onReady();
    that.nethost.emit("ready",this);
  }
  this.channel.onclose = this.emit.bind(this,"close");
}

NetworkInstance.prototype.accept = function(message,cb){
  var that = this;
  this.pconn.ondatachannel = function (event) {
      that.registerChannel(event.channel);
  };
  this.pconn.setRemoteDescription(new RTCSessionDescription(message.desc),function(){
    that.pconn.createAnswer(function(desc){
      that.pconn.setLocalDescription(desc, function () {
        that.nethost.RTCHandle.send({
          cmd:"accept",
          identity:message.identity,
          desc:that.pconn.localDescription
        });
        cb(void(0),that);
      }, cb);
    }, cb);
  },cb);
}

NetworkInstance.prototype.ok = function(message){
  this.pconn.setRemoteDescription(new RTCSessionDescription(message.desc));
}

NetworkInstance.prototype.remoteIce = function(message){
  pc.addIceCandidate(new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
  }));
}

NetworkInstance.prototype.iceCB = function(event){
  if (!event.candidate)
    return;
  this.nethost.RTCHandle.send({
    cmd:"ice",
    identity:this.identity,
		data:{
	    type: 'candidate',
	    label: event.candidate.sdpMLineIndex,
	    id: event.candidate.sdpMid,
	    candidate: event.candidate.candidate
		}
	});
}
