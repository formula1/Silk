var cfile = {};
jQuery(function(){
  Owner.add("openFile", function(file,next){
    console.log("opening");
    if (file.path == null) {
       $("#notifications").html("Please open a file using File Explorer");
    }
    methods.listen("te/open", file.path, function (error, data) {
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
    methods.call("te/save", {path: cfile.path, contents: $("#text").val()});
  }
})
