var __core = __root+"/core";
var DependentArray = require(__core+"/abstract/DependentArray.js");
var async = require("async");
var fs = require("fs");

module.exports = function(req,res,next){
  res.setHeader('content-type', 'application/javascript');
  res.write("var hp="+hp+", wp="+wp+";\n");
  async.eachSeries([
    __core+"/abstract/StreamPromise.js",
    __core+"/abstract/MessageRouter.js",
    __core+"/abstract/MessageWriter.js",
    __core+"/abstract/MessageDuplex.js",
    __core+"/window/public/Window2Server_com.js",
    __core+"/window/public/WindowAbstract.js",
    __core+"/window/public/FrameContext.js",
    __core+"/window/public/WindowManager.js",
    __core+"/window/public/Window2Server_com.js",
    __core+"/network/public/NetworkHost.js",
    __core+"/window/public/WindowAbstract.js",
  ],function(file, next){
    var temp = fs.createReadStream(file, {encoding:"utf-8"});
    temp.on('data',res.write.bind(res));
    temp.on('end',next);
    temp.on('error',next);
  },function(err){
    res.end();
    if(err) return next(err);
  });
}
