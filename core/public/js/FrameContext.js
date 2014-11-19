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
  if(container)
    container.append(this.frame);
  WinAbs.prototype.open.call(that,that.frame[0].contentWindow,function(){ret.resolve(that)});
  return ret;
}

FrameContext.prototype.buildMethods = function(){
  var that = this;
  this.add("openFile", function(params,next){
    console.log("was bound, heard files");
    that.manager.openFile(that,params);
    return null
  });
  this.add("reverse", function(s,next) {
      console.log("received message: "+s);
      return s.split("").reverse().join("");
  })
}
