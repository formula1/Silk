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

function Selector(){
  this.document = cheerio.load("<selector></selector>");
}

Selector.append
