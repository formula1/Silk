var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var closeButton = document.getElementById("closeButton");
startButton.disabled = false;
sendButton.disabled = true;
closeButton.disabled = true;

function uiset(fnst,fnse,fncl){
  startButton.onclick = fnst;
  sendButton.onclick = fnse;
  closeButton.onclick = fncl;
}
