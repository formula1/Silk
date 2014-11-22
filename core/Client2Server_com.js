/*
  Similar to meteor.methods
*/
var WebSocketServer = require('ws').Server;
var EventEmitter = require("events").EventEmitter;
var wss = new WebSocketServer({
  port: 9999
});
//require('./methods.js');
console.log("web socket is at: " + wss.options.host + ":" + wss.options.port);

var ClientEmitter = new EventEmitter();
var id = 0;
wss.on('connection', function (ws) {
  ws.id = id++;
  ClientEmitter.emit("connection",ws);
  ws.on('close',function(){
    ClientEmitter.emit("user:disconnection",ws);
  })
  ws.on('message', function (message) {
    try{
      message = JSON.parse(message);
      console.log(message);
    }catch(e){
      console.log("ERROR")
      console.log("err:"+e)
      console.log("mess: "+message)
      console.log("typeof: "+typeof message);
      ws.close();
    }
    console.log("Message: "+message);
    if(ClientEmitter.listeners(message.name).length == 0){
      return ws.send(JSON.stringify({
        id:message.id,
        ws:ws.id,
        error:"method "+message.name+" does not exist"
      }));
    }
    message.ws = ws.id;
    switch(message.type){
      case "request":
        ClientEmitter.once(message.id,function(message){
          console.log(message);
          ws.send(JSON.stringify(message));
        });
        break;
      case "pipe":
        var fn = function(message){
          ws.send(JSON.stringify(message));
        }
        ClientEmitter.on(message.id,fn);
        ws.on('close',function(){
          ClientEmitter.removeListener(message.id,fn);
        });
        break;
      case "unpipe":
        ClientEmitter.removeAllListeners(message.id);
        break;
      default:
        return ws.send(JSON.stringify({
          id:message.id,
          ws:ws.id,
          error:"Bad message type "+message.type
        }));
    }
    ClientEmitter.emit(message.name,message);
  });
});


global.ClientEmitter = ClientEmitter;
