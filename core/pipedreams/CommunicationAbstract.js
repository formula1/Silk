/*

Listen/Event Support
Request/Provide Support

MiddleWare Support

Read/Write Stream Support
Pipe Support

*/

!(Request).provide(priority,function(req,res,next){

})

function CommunicationAbstract(/* The Selector */){

}

//Events, returns
CommunicationAbstract.prototype.on = function(event,priority,callback){}
CommunicationAbstract.prototype.off = function(event,function){}
CommunicationAbstract.prototype.emitSync = function(event,args){}
CommunicationAbstract.prototype.emitAsync = function(event,args){}
//-Just surrounds each with a process.next tick so it can wipe its hands clean

//Request Provide
CommunicationAbstract.prototype.get = function(event,args,callback){
  //For each possible, Make a Request
}
CommunicationAbstract.prototype.getAll = function(event,args,callback){}
CommunicationAbstract.prototype.provide = function(event,callback){}

//Stream
CommunicationAbstract.prototype.readStream
  .onStart
  .onData
  .onEnd
  = function(event,args,callback){}
CommunicationAbstract.prototype.getAll = function(event,args,callback){}
CommunicationAbstract.prototype.provide = function(event,args,callback){}
