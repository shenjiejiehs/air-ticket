var historySession = {
  _sessions: []
};

historySession.push = function(ctx){
  this._validateTopSession();
  this._sessions.push(ctx);
};

historySession.replace = function(ctx){
  if(this._sessions.length === 0) return;
  this._validateTopSession();
  this._sessions.splice(this._sessions.length - 1, 1, ctx);
};

historySession.pop = function(){
  if(this._sessions.length === 0) return undefined;
  var topCtx = this._sessions.pop();
  return topCtx;
};

historySession.hasSession = function(){
  return this._sessions.length > 0;
};

historySession.topSessionName = function(){
  var topCtx = this._sessions[this._sessions.length - 1];
  return topCtx && topCtx.sessionName;
};

historySession.topSession = function(){
  return this._sessions[this._sessions.length - 1];
};

historySession.end = function(sessionName){
  var idx, l = this._sessions.length ,i = l - 1,
      name, prevCtx;
  for(;i >= 0; i--){
    name = this._sessions[i] && this._sessions[i].sessionName;
    prevCtx = this._sessions[i - 1];
    if(name === sessionName && (!prevCtx || (prevCtx.sessionName !== sessionName))){
      idx = i;
      break;
    }
  }
  if(idx !== undefined && idx !== null){
    this._sessions.splice(idx + 1, l - idx - 1);
    //mark top session item is ended
    this._sessions[this._sessions.length - 1]._$end = true;
  }
};

historySession.reset = function(){
  this._sessions.length = 0;
};

historySession._validateTopSession = function(){
  var topSession = this.topSession();
  if(topSession && topSession._$end){
    this.pop();
  }
};
module.exports = historySession;
