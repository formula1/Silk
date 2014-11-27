/*
  1) Server boots up waiting for connections
  2) A user connects its local machine to the server
  3) The Server Stores who to talk to
  4) The Server gives the local machine a url/authentication its available on


  1) A user connects to the server on a seperate connection
  2) The user goes to specified url/authenticates
  3) Server Sends all messages to local machine sent from user
  4) Server sends all messages to user sent from local machine

  Server never touches routing except for...
  1) Allowing a machine to connect to it
  2) Allowing a user to specify that is the machine it wants to talk to

*/

var net = require("net");



function ProxyServer(websocketport,serversocketport){
  MessageProxy.call(this,function(message,ws){
    ws.send(JSON.stringify(message));
  },function(message,connection){
    con.write(JSON.stringify(message))
  })
  this.locals = {};
  this.users = {};
  this.wss = new WebSocketServer({
    port: websocketport
  });
  console.log("web socket is at: " + this.wss.options.host + ":" + this.wss.options.port);

  var that = this;
  this.wss.on('connection', function (ws) {
    that.clientEnter(ws);
    ws.on('close',function(){
      that.clientLeave(ws);
    })
    ws.on('message', function (message) {
      try{
        message = JSON.parse(message);
      }catch(e){
        return ws.close();
      }
      that.clientMessage(message,ws);
    });
  });

  var that = this;
  this.server = net.createServer(function(c){
    that.slaveEnter(c);
    c.on('end', function() {
      that.slaveLeave(c);
    });
    c.on("data",function(data){
      try{
        message = JSON.parse(message);
      }catch(e){
        return c.close();
      }
      that.slaveMessage(message,c);
    });
  });
  this.server.listen(serversocketport, function() { //'listening' listener
    console.log('server bound');
  });
}
