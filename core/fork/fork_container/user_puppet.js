
var util = require("util");
var events = require("events")
/**
  Emits Events as if it was a websocket
  @constructor
  @augments EventEmitter
  @param {string} id - the id of the websocket
*/
function User(id){
  this.id = id;
}
util.inherits(User,events.EventEmitter);

//This method is to deliver cute notifications without the use feeling overwhelmed
//Generally used when head is sleeping

module.exports = User;
