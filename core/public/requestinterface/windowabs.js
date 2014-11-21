function WinAbs(context){
  this.readyflag = false;
  this.requestqueue = [];
  this.notifyqueue = [];
  this.bindqueue = [];
  this.listeners = {};
  if(context)
    this.open(context);
  //I'd like to implement a off method however jschannel doesn't provide unbind
}

WinAbs.prototype.open = function(context,cb){
  if(typeof context === "undefined")
     throw new Error("to construct "+arguments.callee.name+" You need to provide a window");
  this.context = context;

  var that = this;
  this.channel = Channel.build({
    window: context,
    origin: "*",
    scope: "testScope",
    onReady: function(obj){
      that.ready(obj);
      if(cb) cb();
    },
    debugOutput: true
  });
}

WinAbs.prototype.ready = function(){
  console.log("ready");
  this.readyflag = true;
  while(this.bindqueue.length > 0){
    var temp = this.bindqueue.shift();
    this.channel.bind(temp[0],temp[1]);
  }
  while(this.requestqueue.length > 0)
    this.channel.call(this.requestqueue.shift());
  while(this.notifyqueue.length > 0)
    this.channel.notify(this.notifyqueue.shift());
}

WinAbs.prototype.request = function(namespace,message,cb){
  console.log("request made");
  if(window != window.top){
    console.log("THIS IS NOT THE TOP");
    console.trace();
  }
  var that = this;
  var def;
  message = {method:namespace,params:message};
  if(typeof message.success === "undefined"){
    if(typeof cb === "undefined"){
      def = jQuery.Deferred();
      message.success = function(message){
        def.resolve.call(that,message);
      }
    }else{
      message.success = function(message){
        cb(void(0),message);
      }
    }
  }
  if(typeof message.error === "undefined"){
    if(typeof cb === "undefined"){
      def = jQuery.Deferred();
      message.success = function(message){
        def.fail.call(that,message);
      }
    }else{
      message.error = function(error){
        cb(error,void(0));
      };
    }
  }
  if(!this.readyflag){
    console.log("ready flag");
    this.requestqueue.push(message)
  }else
    this.channel.notify(message);
  if(def) return def;
  return this;
}

WinAbs.prototype.send = function(namespace,message){
  message = {method:namespace,params:message};
  if(!this.readyflag){
    console.log(this.readyflag);
    console.log("pushing");
    this.notifyqueue.push(message)
    console.log(this.channel);
  }else{
    console.log("sending");
    console.log(message);
    this.channel.notify(message);
  }
  return this;
}

WinAbs.prototype.add = function(namespace,cb){
  var def;
  if(typeof cb === "undefined"){
    var that = this;
    def = jQuery.deferred();
  }
  if(cb.promise && cb.resolve) {
    def = cb;
  }
  if(def){
    def.send = def.done.bind(def);
    cb = def.resolve.bind(def);
  }
  var listener = function(trans, s) {
    var def = function(err,m){
      if(err) return trans.error(err);
      trans.complete(v);
    }
    var v = cb(s,def);
    if(typeof v !== "undefined"){
      if(v == null)
        return;
      return v;
    }
    trans.delayReturn(true);
  }
  if(this.readyflag){
    this.channel.bind(namespace, listener)
  }else{
    this.bindqueue.push([namespace,listener]);
  }
  if(def) return def;
  return this;
}

WinAbs.prototype.off = function(){
  throw new Error("complain to jschannel")
}

if(window.parent && window.parent != window){
  window.Manager = new WinAbs(window.parent);
  if(window.top != window.parent)
    window.RootManager = new WinAbs(window.top);
}
