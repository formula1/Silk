var Silk = {}, chan = Channel.build({
    window: window.parent,
    origin: "http://0.0.0.0:3000/",
    scope: "testScope",
    onReady: function () {
      console.log("apparently ready");
      chan.call({
          method: "reverse",
          params:"Am I FUCKING READY>",
          success: function(v) { console.log(v.toString()); }
      });
    }
});

chan.bind("reverse", function(trans, s) {
    return console.log("received message"), s.split("").reverse().join("");
}), Silk.openFile = function(path, mime) {
    chan.notify({
        method: "openFile",
        params: {
            path: path,
            mime: mime
        }
    });
}, Silk.fileToOpen = function() {
    name = "file", name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)", regex = new RegExp(regexS), results = regex.exec(window.location.href);
    return null == results ? null : decodeURIComponent(results[1]);
};
