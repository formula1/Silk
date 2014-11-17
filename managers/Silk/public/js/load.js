var VueManager;
$(document).ready(function () {
  console.log("init");
  VueManager = new WindowManager();
  console.log("done");
  VueManager.on("preBuild", function(winconfig){
    winconfig.id = winconfig.title;
    winconfig.running = false;
    winconfig.minimized = true;
    winconfig.zIndex = -1;
  });
  VueManager.on("postRegister", function(win){
    $(".loader span").css("animationIterationCount", "1");
  })
  VueManager.on("load", function(){
    console.log("loaaded");
    initializeManager();
    console.log("done");
    window.setTimeout(function () {
      $(".loader").fadeOut();
    }, 500)
  })
  VueManager.on("openFile", function(sniffed,candidates,originator){
    if(!("Text Editor" in candidates)){
      alert("WHERES THE TEXT EDITOR?!");
      throw Error("issues : /");
    }
    var te = candidates["Text Editor"];
    te.send("openFile", sniffed);
    if(te.state != "running")
      te.config.running = true;
    console.log("should be ok now...");
  })
});
