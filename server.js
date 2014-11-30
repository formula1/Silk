global.__root = __dirname;
global.hp = process.env.hp || 3000;
global.wp = process.env.wp || 9999;
global.sp = process.env.sp || 3500;

var path = require('path');

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
