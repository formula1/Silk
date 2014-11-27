/*
  Similar to meteor.methods
*/
var WebSocketServer = require('ws').Server;
var MessageRouter = require(__root+"/core/abstract/MessageRouter.js");
/**
  Provides a commincation between anything on the server and the websocket connected to the client.
  Is the serverside implementation of {@linkcode https://github.com/einaros/ws}

  @memberof ServerSide
  @constructor
  @augments MessageRouter
  @param {integer} port - the port to listen on
*/
function Server2Client(port){
  var id = 0;
  MessageRouter.call(this,function(message,user){
    if(message.user){
      delete message.user;
    }
    user.send(JSON.stringify(message));
  });
  this.wss = new WebSocketServer({
    port: 9999
  });
  console.log("web socket is at: " + this.wss.options.host + ":" + this.wss.options.port);

  var that = this;
  this.wss.on('connection', function (ws) {
    ws.id = id++;
    that.emit("connection",ws);
    ws.on('close',function(){
      that.emit("user:disconnection",ws);
    })
    ws.on('message', function (message) {
      try{
        message = JSON.parse(message);
      }catch(e){
        return ws.close();
      }
      console.log(message.name+": "+that.getListeners(message.name).length);
      that.routeMessage(message,ws);
    });
  });
};

Server2Client.prototype = Object.create(MessageRouter.prototype);
Server2Client.prototype.constructor = Server2Client;

module.exports = Server2Client;
