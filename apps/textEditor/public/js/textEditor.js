var cfile = {};
jQuery(function(){
  Manager.add("openFile", function(file,next){
    console.log("opening");
    if (file.path == null) {
       $("#notifications").html("Please open a file using File Explorer");
    }
    ApplicationFork.pipe("te/open", file.path, function (error, data) {
      if (error){
        alert(error);
      }
      if(data.state = "loading"){
       $("#notifications").html("Loading");
      }
      if(data.content != undefined){
        $("#text").val(data.content);
        $("#notifications").html(file.path);
        cfile = file;
      }
    });
    return null;
  });
});

$("#save").click(function(){
  if(cfile.path != null){
    ApplicationFork.trigger("te/save", {path: cfile.path, contents: $("#text").val()});
  }
})
