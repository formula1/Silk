/*

What would be needed is....
For Events
-Application Selector
  -By Name
  -By Type (Enmurated)

Message Object
-EventName - Generic (Open File, Scan Directory)
-MessageType - Notfify, RequestOnce, RequestListening, Stream
-If Stream
  -Mime Type
  -Encoding
  -Human Language (If applicable)
  -Length (if applicable)

And the application will handle everything else

For processing
-That Application should be able to process things on its own.

-Accepted Return Value


*/

var cheerio = require("cheerio");
var fs = require("fs");
var dom = cheerio.load(fs.readFileSync(__dirname+"/example.html"));
var ws = "";
function readOb(ob, limit,c){
  for(var i in ob){
    if(typeof ob[i] == "function") continue;

    console.log(new Array(c+1).join("  ")+"("+typeof ob[i]+")"+i+": "+ob[i]);
    if(typeof ob[i] == "object" && limit > c){
      c++;
      readOb(ob[i], limit,c);
    }
  }
}
readOb(dom, 5,0);
