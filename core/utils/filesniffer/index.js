var fs = require("fs");
var mime = require("mime");
var magic = require('stream-mmmagic');
var LanguageDetect = require('languagedetect');
var lngDetector = new LanguageDetect();

var readables = {}

fs.readdirSync(__dirname+"/humanconvert").forEach(function(file){
  readables[file] = require(__dirname+"/humanconvert/"+file);
})


module.exports = function(file, next){
  var boo = fs.existsSync(file);
  if(!boo) return next(new Error("Non-existantfile"));
  var ret = {
    path:file,
    mimetype:mime.lookup(file)
  };
  var input = fs.createReadStream(file);

  magic(input, function (err, mime, output) {
    if (err) return next(err);

    console.log('TYPE:', mime.type, ret.types);
    console.log('ENCODING:', mime.encoding);

    ret.encoding = mime.encoding
    var poss = ret.mimetype.split("/")[1];
    if(!(poss in readables)) return next(void(0),ret);
    readables[poss](file,function(err,text){
      ret.language = lngDetector.detect(text, 1)[0];
      next(void(0),ret);
    })
  });
}
