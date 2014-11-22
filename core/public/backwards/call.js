var methods = {};
// method calls that are sent and waiting an answer
methods.sent = {};
methods.listeners = {};

// function to call server method
methods.call = function (name, data, callback) {
  DocumentHost.get(name,data,callback);
}
methods.listen = function (name, callback) {
  return DocumentHost.pipe.apply(DocumentHost,arguments);
}
methods.remove = function(id){
  DocumentHost.unpipe(id);
}
// test
methods.call("silk/apps/list", {
  name: "test"
}, function (error, data) {
  console.log("This is inside the callback");
  console.log(error);
  console.log(data);
});
