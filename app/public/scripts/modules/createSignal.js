var R = require('common/frp/rstream');
// @ifdef  DEBUG
var assert = require('common/assert');
var type = require('common/type');
// @endif
/**
 * signals should be sent and reacted synchronously(handler itself
 *  could be an asynchronous operation though)
 **/
var SignalProto = {
  /**
   * Send a named signal with payload.
   * Could specify whether the signal need to be recorded
   * so that it can be replayed later.
   * @param  {[String]} name       [signal name]
   * @param  {[Object]} payload    [payload object]
   * @param  {[Boolean]} needRecord [whethre to be recorded, default is false]
   * @return {[signal]}            [signal instance]
   */
  send: function(name, payload, needRecord) {
    var sig = this.getSig(name);
    console.log('signal sent: ' + name);
    if (needRecord === true) {
      recordSignal(name, payload, this);
    }
    sig(payload);
    return this;
  },
  bindSendWith: function(name){
// @ifdef DEBUG
    assert(type.isString(name), '[createSignal.bindSendWith]invalid signal name, should be a string! given:' + name, TypeError);
// @endif
    this._bindSendFns = this._bindSendFns || Object.create(null);
    var bindFn = this._bindSendFns[name];
    if(!bindFn){
      bindFn = this._bindSendFns[name] = this.send.bind(this, name);
    }
    return bindFn;
  },
  replay: function() {
    var record = this._prevSignal;
    var sig;
    if (record != null) {
      sig = this.getSig(record.name);
      sig(record.payload);
    } else {
      console.log('[signal replay]no signal is recorded!');
    }
    return this;
  },
  on: function(name, handler){
    var sig = this.getSig(name);
    sig.on(handler);
    return this;
  },
  getSig: function(name){
    return R.isStream(name) ? name : this._sigBag.get(name);
  }
};

module.exports = function createSignal() {
  var signal = Object.create(SignalProto);
  signal._sigBag = new _SigBag();
  signal._prevSignal = null;

  return signal;
};

// helpers
function recordSignal(name, payload, signal){
  var prevSignal = signal._prevSignal = signal._prevSignal || {};
  prevSignal.name = name;
  prevSignal.payload = payload;

}

function _SigBag(){
  this._bag = {};
}
_SigBag.prototype.get = function(name){
  if(typeof name !== 'string'){
    throw new TypeError('[createSignal]invalid signal name! given:'+name);
  }
  var sig = this._bag[name];
  if(!R.isStream(sig)){
    sig = this._bag[name] = R();
  }
  return sig;
};
