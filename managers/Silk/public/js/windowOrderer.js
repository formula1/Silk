// order of open windows.  Used to calculate z-index.
var winO = [];

function wintop(win){
  var olz = win.zIndex;
  win.zIndex = winO.length;
  winO.push(win);
  if(olz == -1) return win.zIndex++;

  winO.splice(olz-1,1);
  for(var i=olz-1;i<winO.length-1;i++)
    winO[i].zIndex--;
}

function winremove(win){
  if(win.zIndex == -1) throw Error("You shouldn't be minimizing what already is");
  var olz = win.zIndex-1;
  winO.splice(win.zIndex-1,1);
  win.zIndex = -1;
  for(var i=olz;i<winO.length;i++)
    winO[i].zIndex = i+1;
    console.log(VueManager.windows[win.id])
  VueManager.windows[win.id]
  .request("reverse","Will this be reversred?").done(function(ret){
    console.log(ret);
  });
}


var wm;
var taskbar;

function initializeManager(){
  var configs = new Vue({
    data: function () {
      return {
        windows: VueManager.configs
      }
    }
  });
  wm = configs.$addChild({
    inherit: true,
    el: '#desktop',
    methods: {
      buildChannel:function(win){
        VueManager.windows[win.id]
          .open($("#desktop iframe[data-name='"+win.id+"']")[0])
          .done(function(winob){
            wintop(win);
          });
      },
      minimize: function(app){
        winremove(app);

      }
    },
  });

  taskbar = configs.$addChild({
    inherit: true,
    el: '#taskbar',
    methods: {
      open: function (app) {
        if(!app.running) return app.running = true;
        if(app.zIndex == winO.length)
          return winremove(app);
        wintop(app);
      },
      minimize: function (app) {
        // put window on top
        winremove(app);

      }
    }
  })
}
