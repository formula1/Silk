
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
