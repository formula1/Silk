var http = require('http');
var express = require('express');
var SockJS = require('sockjs');
var program = require('commander');

process.on('SIGINT', function() {
    // put prompt on line after ^c
    console.log("");
    process.exit();
});

// has info and state of various parts of Silk.  Used mainly be api.
global.Silk = {
  set: function (prop, value) {
    if (prop in Silk.data) {
      Silk.data[prop].value = value;
    } else {
      Silk.data[prop] = {
        value: value,
        listeners: []
      };
    }
  },
  get: function (prop) {
    return Silk.data[prop].value;
  },
  change: function (prop) {
    var listeners = Silk.data[prop].listeners;

    function send(i) {
      process.nextTick(function () {
        listeners[i]();
      });
    }

    for (var i = 0; i < listeners.length; ++i) {
      send(i);
    }
  },
  listen: function (prop, next) {
    /*jshint -W018 */
    if (!prop in Silk.data) {
      return;
    }
    /*jshint +W018 */
    Silk.data[prop].listeners.push(next);
  },
  data: {}
};
global.__root = __dirname;

var app = express(),
  server,
  wss,
  windows,
  url,
  toLoad = 2,
  loaded = 0;

program
  .version('0.3.0')
  .option('-r, --remote', 'Remotely access Silk')
  .option('-d, --dev', 'Show debug messages')
  .option('-o, --open', 'Open Silk in a window')
  .option('--devtools', 'Show toolbar in nw.js for debugging')
  .parse(process.argv);

/*jshint -W030 */
program.dev == true ? global.debug = console.log : global.debug = function () {};
/* jshint +W030 */

//loading spinner
function Spinner() {
  this.step = 0;
  this.pattern = '|/-\\';
  var interval;
  this.start = function () {
    var that = this;
    process.stdout.write('\r ' + that.pattern[that.step] + ' Starting Silk');
    interval = setInterval(function () {
      process.stdout.write('\r ' + that.pattern[that.step] + ' Starting Silk');
      that.step += 1;
      if (that.step === 4) {
        that.step = 0;
      }
    }, 150);
  };
  this.stop = function () {
    clearInterval(interval);
  };
}

var spinner = new Spinner();
spinner.start();
// hides spinner and shows url when finished loading;
function loader() {
  loaded += 1;
  if (loaded === toLoad) {
    spinner.stop();
    process.stdout.write('\r ' + url);
    console.log('');
  }
}

app.get('/', function (req, res) {
  res.sendFile(__root + "/window-manager/public/index.html");
});

// static files for client
app.use(express.static(__dirname + '/window-manager/public'));
app.get(/^\/bc\//, require(__root + "/core/bower_static.js"));
app.get("/api.js", require(__root + "/core/client_api.js"));

server = app.listen(3000, function () {
  var add = server.address();
  url = 'Silk at http://' + add.address + ':' + add.port;
  loader();
});

var sockOptions = {
  sockjs_url: '//cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js'
};

if (!program.dev) {
  sockOptions.log = function (severity, message) {
    if (severity === 'error') {
      console.log(message);
    }
  };
}

wss = SockJS.createServer(sockOptions);
wss.installHandlers(server, {
  prefix: '/ws'
});

require(__root + "/core/fork_framework")(app, wss, function () {
  loader();
});

require('./core/remote.js');

if (program.remote) {
  Silk.get('remote/start')(true);
}

if (program.open) {
  require('./core/nw/open.js')(program.devtools);
}