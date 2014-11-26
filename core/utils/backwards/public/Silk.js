var Silk = {};

Silk.openFile = function(path, mime) {
  Manager.trigger("openFile",{
      path: path,
      mime: mime
  })
}, Silk.fileToOpen = function() {
    name = "file", name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)", regex = new RegExp(regexS), results = regex.exec(window.location.href);
    return null == results ? null : decodeURIComponent(results[1]);
};
