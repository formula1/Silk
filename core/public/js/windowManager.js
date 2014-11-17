
// channel for each window
var channels = {};

function FrameContext(manager,winconfig){
  manager.emit("preBuild",winconfig);
  if(!("id" in winconfig)) throw new Error("I want to ensure you are in control")
  this.id = winconfig.id;
  this.manager = manager;
  this.config = winconfig;
  Object.defineProperty(this,"state",{
    get: function () {
      if(typeof this.frame == "undefined")
        return "dormant";
      var doc = this.frame[0].contentDocument || this.frame[0].contentWindow.document;
      if (  doc.readyState  != 'complete' )
        return "loading";
      if(!this.channel)
        return "buildingchannel";
      return "running";
    }
  });
  WinAbs.call(this);
  this.buildMethods();
}
FrameContext.prototype = Object.create(WinAbs.prototype);
FrameContext.prototype.constructor = FrameContext;

FrameContext.prototype.open = function(container){
  if(this.state != "dormant"){
     throw Error("This window is already open");
  }
  if(typeof container == "undefined")
    throw Error("To Open, this window needs a container");
  container = $(container);
  if(container.prop("tagName").toLowerCase() != "iframe"
  || container.attr("src") != this.config.url){
    this.frame = '<iframe class="content" data-name="'+this.config.title+'" src="'+this.config.url+'"></iframe>';
    this.frame = $(this.frame);
  }else{
    this.frame = container;
    console.log(this.frame);
    container = false;
  }
  var ret = jQuery.Deferred();
  var that = this;
  var done = 0;
  var doc = this.frame[0].contentDocument || this.frame[0].contentWindow.document;
  if(container)
    container.append(this.frame);
  if(doc.readyState === "complete")
    WinAbs.prototype.open.call(that,that.frame[0].contentWindow,function(){ret.resolve(that)});
  else
    this.frame.on("load",function(e){
      console.log("loading");
      WinAbs.prototype.open.call(that,that.frame[0].contentWindow,function(){ret.resolve(that)});
      console.log(that.channel);
    });

  return ret;
}

FrameContext.prototype.buildMethods = function(){
  var that = this;
  this.on("openFile", function(params,next){
    console.log("was bound, heard files");
    that.manager.openFile(that,params);
    return null
  });
  this.on("reverse", function(s,next) {
      console.log("received message: "+s);
      return s.split("").reverse().join("");
  })
}


function WindowManager(stop){
  EventEmitter.call(this);
  this.configs = [];
  this.windows = {};

  if(stop) return this;
  this.initialize();
}
WindowManager.prototype = Object.create(EventEmitter.prototype);
WindowManager.prototype.constructor = WindowManager;
WindowManager.prototype.on = EventEmitter.prototype.addListener;
WindowManager.prototype.off = EventEmitter.prototype.removeListener;

WindowManager.prototype.initialize = function(){
  var that = this;
  $.ajax("/windows.json").done(function(configs){
    configs.forEach(function(config){
      that.registerWindow(config);
    });
    that.emit("load");
  })
  return this;
}



WindowManager.prototype.registerWindow = function(config){
  if(!(config instanceof FrameContext))
    var win = new FrameContext(this, config);
  else if(config.id in this.windows) return
  this.windows[config.id] = win;
  this.configs.push(config);
  this.emit("registered", win);
}

WindowManager.prototype.openFile = function(source,file){
  console.log("opening");
  var that = this;
  var windows = this.windows
  $.ajax("/filesniffer?file="+file.path).done(function(sniffed){
    console.log(sniffed);
    var candidates = {};
    var count = 0;
    windowloop:
    for (var i in windows){
      if(windows[i] == source){continue;}
      if(!("listeners" in windows[i].config)){
        console.log("this window has no listeners");
        continue;
      }
      if(!("openFile" in windows[i].config.listeners)){
        console.log("this window doesn't have an open file listener");
        continue;
      }

      for(var j in windows[i].config.listeners.openFile){
        if(!(j in sniffed)) continue;
        var reg = windows[i].config.listeners.openFile[j];
        reg = new RegExp(reg);
        if(!reg.test(sniffed[j])){
          console.log("fialed on "+j);
          continue windowloop;
        }
      }

      candidates[i] = windows[i];
      count++;
    }
    if(count == 0)
      return alert("Your file of "+JSON.stringify(sniffed)+" has no takers : /");
    that.emit("openFile",sniffed,candidates,source);
  }).fail(function(e){
    console.log(e);
  })
}
