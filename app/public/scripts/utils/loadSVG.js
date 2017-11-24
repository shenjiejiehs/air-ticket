module.exports = function loadSVG(svgStr){
  var doc = window.document;
  var body = doc.body;
  var div = doc.createElement('div');
  div.innerHTML = svgStr;
  div.style.width = "0";
  div.style.height = "0";
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  body.insertBefore(div, body.firstChild);
};
