// modularized event tracking and timing tracking


define('utils/tracker', function() {

  var track = function(category, action, label, value) {
    if (window.ga) {
      ga('send', 'event', category, action, label, value);
// @ifdef DEBUG
      console.log('ga', ['send', 'event', category, action, label, value]);
// @endif
    }
  };

  var timingDict = {};
  var startTiming = function(category, name, label) {
    var key = [category, name, label].join('_');
    timingDict[key] = new Date();
  };

  var endTiming = function(category, name, label) {
    var key = [category, name, label].join('_');

    if (key in timingDict) {
      var timing = new Date() - timingDict[key];
      delete timingDict[key];

      if (window.ga) {
        ga('send', 'timing', category, name, timing, label);
      }
    }
  };

  var clearTiming = function(category, name, label) {
    var key = [category, name, label].join('_');
    delete timingDict[key];
  };

  return {
    track: track,
    startTiming: startTiming,
    endTiming: endTiming,
    clearTiming: clearTiming
  };

});
