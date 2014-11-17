function User(config,args){
  this.config = config;
  this.super.apply(this,args)
}

User.spawn = function(){
   //create a copy of the current prototype.
    var args = [].splice.call(arguments,0);
    console.log(args);
    var other = args.shift();
    var protoCopy = User.prototype;
    User.prototype = Object.create(other.prototype);
    User.prototype.super = other;
    User.prototype.constructor = User;

    var clone = new User(void(0),args);
    User.prototype = protoCopy;
    delete User.prototype.super;
    return clone;
}

if(window.top !== window && !window.Owner)
  window.Owner = User.spawn(WinAbs,window.top);
