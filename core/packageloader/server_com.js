/*
  Similar to meteor.methods
*/



var methods = {
  requests:{},
  user_reqs:{},
  users:{},
  responders:{},
  child_resp:{},
  childs:{}
};

methods.child = function(child){
  this.child_resp[child.pid] = [];
  this.childs[child.pid] = child;
  child.on("message", function(message){
    console.log(JSON.stringify(message));
    if(message.cmd == "send"){
      if(!this.requests[message.message.id]){
        console.log("user removed or no request");
        return;
      }
      this.requests[message.message.id].send(JSON.stringify(message.message));
    }else if(message.cmd == "add"){
      this.responders[message.name] = child;
      this.child_resp[child.pid].push(message.name)
    }
  }.bind(this))
  child.on("error",function(e){
    console.log(e);
  });
  child.on("close",function(code,signal){
    for(var i in this.children[child.pid]){
      delete this.reponders[this.children[child.pid][i]];
    }
    delete this.child_resp[child.pid];
    delete this.childs[child.pid];
  })
}

methods.call = function(ws,message){
  try{
    message = JSON.parse(message);
  }catch(e){
    console.log("ERROR")
    console.log("err:"+e)
    console.log("mess: "+message)
    console.log("typeof: "+typeof message);
  }
  if(!(message.name in this.responders)){
    console.log(JSON.stringify(message));
    return ws.send(JSON.stringify({
      id:message.id,
      user:ws.id,
      error:"method "+message.name+" does not exist"
    }));
  }
  if(!this.users[ws.id]){
    this.users[ws.id] = ws;
    ws.on("close",function(){
      delete this.users[ws.id];
      for(var i in this.user_reqs[ws.id]){
        delete this.requests[this.user_reqs[ws.id][i]];
      }
      delete this.user_reqs[ws.id];
      for(var i in this.childs){
        this.childs[i].send({cmd:"disconnect",user:ws.id});
      }
    }.bind(this))
    this.user_reqs[ws.id] = [];
  }
  message.user = ws.id;
  this.user_reqs[ws.id].push(message.id);
  this.responders[message.name].send(message);
  this.requests[message.id] = ws;
}

// make global because it will be used in most files.
global.methods = methods;
