var methods = {};
// method calls that are sent and waiting an answer
methods.sent = {};
methods.listeners = {};

// function to call server method
methods.call = function (name, data, callback) {
  if(!callback)
    return ApplicationFork.trigger(name,data);
  ApplicationFork.get(name,data,callback);
}
methods.listen = function (name, callback) {
  return ApplicationFork.pipe.apply(ApplicationFork,arguments);
}
methods.remove = function(id){
  ApplicationFork.unpipe(id);
}
// test
methods.call("silk/apps/list", {
  name: "test"
}, function (error, data) {
  console.log("This is inside the callback");
  console.log(error);
  console.log(data);
});
