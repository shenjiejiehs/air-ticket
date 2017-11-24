/*global ActiveXObject*/
/*eslint no-empty: "off"*/
function getXHR() {
  //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
  var xhr, i, len, progId, progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0', 'Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0'];
  if (typeof XMLHttpRequest !== "undefined") {
    return new XMLHttpRequest();
  } else if (typeof ActiveXObject !== "undefined") {
    for (i = 0, len = progIds.length; i < len; i += 1) {
      progId = progIds[i];
      try {
        xhr = new ActiveXObject(progId);
      } catch (e) {}
    }
  }

  return xhr ? xhr : false;
}

module.exports = getXHR;
