function gotStream(stream) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext();

  // Create an AudioNode from the stream
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Connect it to destination to hear yourself
  // or any other node for processing!
  mediaStreamSource.connect(audioContext.destination);
  for(var i in audioContext.destination)
    console.log(i);
}
function gotError(err){
  console.log(arguments);
  console.log("error");
}
