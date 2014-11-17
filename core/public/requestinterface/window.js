function WindowContext(context){
  if(context === window.top)
   throw new Error("You'll want to create a user instead");
  WinAbs.call(this,context);
}

WindowContext.prototype = Object.create(WinAbs.prototype);
