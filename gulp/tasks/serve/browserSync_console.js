(function(w) {
  var logCache = [];
  var socketInit = false;
  var oldLog = console.log.bind(console);
  console.log = function() {
    var args = [].slice.call(arguments),
      s = w.___browserSync___;
    if (s && s.socket) {
      if (!socketInit) {
        socketInit = true;
        s.socket.on('bs::console', function(msg) {
          oldLog('[bs::console] ' + msg);
        });
      }
      setTimeout(function() {
        if (logCache.length) {
          logCache.forEach(socket_emit.bind(null, s));
          logCache.length = 0;
        }
        socket_emit(s, args);
      }, 0);
    } else {
      logCache.push(args);
    }

    oldLog.apply(console, args);
  };

  function socket_emit(s, args) {
    s.socket.emit('bs::console', args.map(function(a) {
      try {
        return a instanceof XMLHttpRequest ? '[XHR response] - ' + JSON.stringify({
          url: a.responseURL,
          response: a.response,
          responseText: a.responseText,
          status: a.status
        }) : JSON.stringify(a);
      } catch (e) {
        return ({}).toString.call(a);
      }
    }).join(' '));
  }
})(window);
