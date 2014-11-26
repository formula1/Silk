if(typeof module != "undefined" && module.exports){
  var MessageWriter = require(__root+"/core/abstract/MessageWriter.js");
}

// connect to socket
function Server(host,port,path){
  var that = this;
  path = (path)?path:false;
  MessageWriter.call(this, function(message){
    if(path)
      message.name = path + message.name;
    that.socket.send(JSON.stringify(message));
  });
  // method calls that are sent and waiting an answer
  try {
    this.host = "ws://"+host+":"+port;
    this.socket = new WebSocket(this.host);
    this.socket.onopen = this.onReady.bind(this);
    this.socket.onmessage = function(message){
      try{
        message = JSON.parse(message.data);
      }catch(e){
        that.socket.close();
      }
      console.log("recieved message")
      that.returnMessage(message);
    }
    this.socket.onclose = function(){
      console.log('Socket Status: ' + that.socket.readyState + ' (Closed)');
      that.onNotReady();
    };
  } catch (exception) {
    console.log('Error' + exception);
  }
}

Server.prototype = Object.create(MessageWriter.prototype);
Server.prototype.constructor = Server;

if(typeof module != "undefined" && module.exports){
  module.exports = Server;
}else{
  window.DocumentHost = null;
  (function(url){
    url = /^(http[s]?):\/\/([0-9\.]+|[a-z\-.]+)([?::][0-9]+)?([\/][A-Za-z0-9_\-]+)(\?.*)?/.exec(url);
    console.log(url);
    window.DocumentHost = new Server(url[2],9999);
    window.ApplicationFork = new Server(url[2],9999,url[4].substring(1)+"-");
  })(document.URL)
}
