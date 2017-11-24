var proto = {
  done: function(onDone, onCancel) {
    var r = /^PENDING_(.*)/.exec(this._state);

    if (this._state !== 'INIT' && !r) {
      return;
    }
    if (this._registered) {
      return;
    }
    this._registered = true;

    this._onDone = onDone;
    this._onCancel = onCancel;

    if (r) {
      var state = r[1];
      var cb = this['_on' + state];

      this._state = 'DONE_' + state;
      if (typeof(cb) === 'function') {
        cb(this._result);
      }
    }
  },
  resolve: function(result) {
    return this._done('Done', result);
  },
  cancel: function() {
    return this._done('Cancel');
  },
  _done: function(state, result) {
    if (this._state !== 'INIT') {
      return;
    }

    if (this._registered) {
      var cb = this['_on' + state];

      this._state = 'DONE_' + state;
      if (typeof(cb) === 'function') {
        cb(result);
      }
    } else {
      this._result = result;
      this._state = 'PENDING_' + state;
    }
  }
};

module.exports = function $onceMaker() {
  var emitter = Object.create(proto);

  emitter._state = 'INIT';

  return emitter;
};
