var getHash = require('common/getHash');
var type = require('common/type');

function makeCursor(context, kpath) {
  var cursors = context._cursors = context._cursors || getHash(),
    cursor = cursors[kpath];
    if (!cursor) {
      cursor = {
        get: function(kp) {
          return context.get(kpath + (type(kp) === 'string' && kp.trim().length ? '.' + kp.trim() : ''));
        },
        set: function(kp, data, isSilent) {
          if (type(kp) === 'object') {
            isSilent = data;
            context.set(Object.keys(kp).reduce(function(m, k) {
              m[kpath + '.' + k] = kp[k];
              return m;
            }, {}), isSilent);
          } else if (type(kp) === 'string') {
            kp = kp.trim();
            context.set(kpath + (kp.length ? '.' + kp : ''), data, isSilent);
          }
          return this;
        },
        release: function() {
          delete context._cursors[kpath];
          if (Object.keys(context._cursors).length === 0) {
            delete context._cursors;
          }
        }
      };
      context._cursors[kpath] = cursor;
    }
    return cursor;
}

module.exports = makeCursor;
