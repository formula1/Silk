var jspath = require()

var users = {};

function id(){
  return Date.now()+"|"+Math.random();
}

function RTCServer (ClientEmitter){
  ClientEmitter.on("RTC-user", this.addUser.bind(this));
  ClientEmitter.on("RTC-list", this.search.bind(this));
  ClientEmitter.on("RTC-order", this.emit.bind(this,"order"));
  ClientEmitter.on("RTC-offer", this.offer.bind(this));
}

util.inherits(RTCServer,EventEmitter);

RTCServer.prototype.addUser = function(message){
  users[message.id] = message;
}

RTCServer.prototype.offer = function(message){
  if(!users[message.data.identitiy]){
    console.log("cannot offer to a nonexistant user");
    return;
  }
  message.data.identity = message.id;
  ClientEmitter.emit(message.data.identitiy,message);
//  users[message.data.identitiy].send(message.data);
}

RTCServer.prototype.accept = function(message){
  if(!users[message.data.identitiy]){
    console.log("cannot offer to a nonexistant user");
    return;
  }
  message.data.identity = message.id;
  if(!message.data || !message.data.id){
    message.data = null;
    message.error = "cannot send a message without a target id";
  }
  ClientEmitter.emit(message.data.identitiy,message);

//  users[message.data.identitiy].send(message.data);
}


RTCServer.prototype.search = function(message){
  if(this.listeners("search") != 0){
    return this.emit("search",message);
  }
  if(!message.data || !message.data.jspath){
    message.data = {jspath:".*"};
  }
  try{
    message.data = jspath(message.data.jspath,users).get().map(function(item){
      return = {
        id:item.id,
        app:item.app,
        sends:item.sends,
        connections:item.connections
      };
    });
    message.error = null;
  }catch(e){
    message.data = null;
    message.error = e.toString;
  } finally{
    ClientEmitter.emit(message.id,message);
  }
};

RTCServer.prototype.stun =  function(message){

}
