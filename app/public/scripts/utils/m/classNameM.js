var cx = require('./className');

function classNameM(cm){
  return function _cxm(clsOpts){
    return addClassModule(cx(clsOpts), cm);
  };
}

function addClassModule(str, cm){
  var classes = str.trim().split(/\. /).filter(Boolean);
  return classes.map(function(cls){
    return cm(cls);
  }).join(' ');
}

module.exports = classNameM;
