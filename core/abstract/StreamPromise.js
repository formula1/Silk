function StreamPromise(ctx){
  if(ctx) this.ctx = ctx;
  this._fails = [];
  this._dones = [];
}

StreamPromise.prototype.inherit = function(ctx){
  this.ctx = ctx;
  return this;
}

StreamPromise.prototype._write = function(err,data){
  if(err){
    for(var i=0;i<this._fails.length;i++)
      this._fails[i](err)
    return;
  }
  for(var i=0;i<this._dones.length;i++)
    this._dones[i](data)
}

StreamPromise.prototype.fail = function(fn){
  this._fails.push(fn);
  return this;
}

StreamPromise.prototype.done = function(fn){
  console.log(fn)
  this._dones.push(fn);
  return this;
}

StreamPromise.prototype.send = function(data){
  if(!this.ctx) throw Error("cannot send without a context");
  console.log(this.ctx);
  this.ctx(data);
  return this;
}
