var browserify = require('browserify');
var url = require("url");

module.exports = function(req,res,next){
  var path = url.parse(req.originalUrl).pathname;
  if(!/^\/?nm\/.*/.test(path)) return next();
  if(/.*\/\.\.?\/.*/.test(path)) return next();
  if(/.*\/\/.*/.test(path)) return next();

  res.setHeader('content-type', 'application/javascript');
  var b = browserify(path.split("/")[2]).bundle();
  b.on('error', next);
  b.pipe(res);

};
