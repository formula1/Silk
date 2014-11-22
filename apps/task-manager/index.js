var c = require("child_process");

for(var i in process.env){
  console.log("cihdl: "+i);
}
var top = c.spawn("top",["-b"], {"TERM":process.env.TERM});

var curusers = {};
/*
SESSION
SESSIONTYPE
LOGNAME
_
TERM
*/

methods.add({
  "tasks": function (n,call_ob,next) {
    if(curusers[call_ob.ws.id]){
      console.log("already have: "+call_ob.ws.id);

      return;
    }

    curusers[call_ob.ws.id] = next;
    call_ob.ws.on("close", function(){
      delete curusers[call_ob.ws.id];
    })
  }
});

top.stdout.on('data', function (data) {
  if(Object.keys(curusers).length > 0)
  data = data.toString("utf-8").split("\n").map(function(item){
    return item.split(/\s+/);
  })
  for(var i in curusers){
    curusers[i](void(0),data);
  }
});

top.stderr.on('data', function (data) {
  console.log('top stderr: ' + data);
});
