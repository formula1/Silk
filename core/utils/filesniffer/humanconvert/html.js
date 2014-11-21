htmlToText = require("html-to-text");

module.exports = function(path, next){
      htmlToText.fromFile(path, function(err, text) {
          if (err) return console.error(err);
          console.log(text);
          next(text)
      });
    }
