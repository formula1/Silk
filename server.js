global.__root = __dirname;
var path = require('path');

require(__root+"/core/Server2Client_com.js");

var express = require('express')
var app = express()

var windows = require(__root + "/core")(app);

var server = app.listen(3000, function () {
  var add = server.address();
  console.log('Silk at http://%s:%s', add.address, add.port)
});

// make app availalbe outisde nodeos
var localtunnel = require('localtunnel');

localtunnel(3000, function(err, tunnel) {
  if (err) {
    console.log(err);
  }
  // the assigned public url for your tunnel
  // i.e. https://abcdefgjhij.localtunnel.me
  console.log("Go to " + tunnel.url + " to remotely access Silk");
});
