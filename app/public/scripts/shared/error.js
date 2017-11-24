(function(showAlert) {
  if (location.hostname != 'localhost') {

    if (location.search.search(/[?&]debug=1/) != -1) {
      showAlert = true;
    } else {
      showAlert = false;
    }

    window.onerror = function(msg, url, lines) {
      if (window.ga) {
        if (lines == 1) return; //drop the ios client bug
        ga('send', 'event', 'error', msg, url + ':' + lines);
      }

      if (showAlert) {
        alert(url + ':' + lines);
        alert(msg);
      }

      console.log(url + ':' + lines);
      console.log(msg);
      return true;
    };
  }
})();

