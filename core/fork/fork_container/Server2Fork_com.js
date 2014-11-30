/**

  A very minor serverside implementation of fork.send
  @memberof ServerSide
  @constructor
  @param {object} application - window config and other data
  @param {child_process} fork - the fork to configure
*/
function Server2Fork(j,fork){
  var listeners = {};
  fork.on("message", function(m){
    console.log("recieved mess");
    switch(m.cmd){
      case "send":
        m.message.name = j.name +"-"+m.message.name;
        ClientEmitter._returns.emit(m.message.id,m.message);
        break;
      case "add":
        console.log("add: "+m.key);
        listeners[m.key] = function(data, message,next){
          console.log("sending to fork");
          message.name = m.key;
          message.user = message.user.id;
          fork.send(message);
        };
        ClientEmitter.add(j.name +"-"+ m.key,listeners[m.key]);
        break;
      case "message":
        ClientEmitter.routeMessage(m.message,fork,function(message,fork){
          console.log("back again");
          fork.send({cmd:"message",message:message});
        })
        break;
      default:
        console.log(m);
        throw new Error("nonexsistant command");
  //      case "remove":
    }
  });
  fork.on("error",function(e){
    console.log(j.name+e);
  });
  fork.on("close",function(code,signal){
    for(var i in listeners){
      ClientEmitter.removeListener(i,listeners[i]);
    }
    delete listeners;
    ClientEmitter.emit("fork:disconnect",fork);
  })
  ClientEmitter.on("user:disconnect",function(user){
    fork.send({cmd:"disconnect",user:user.id});
  })
}

module.exports = Server2Fork;
