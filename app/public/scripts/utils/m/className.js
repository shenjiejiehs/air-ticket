var type = require('common/type');
function className(options){
  var classes;
  if(type.isObject(options)){
    classes = Object.keys(options).reduce(function(m, clsName){
      if(!!options[clsName]){
        m.push(clsName);
      }
      return m;
    },[]);
  }else if(type.isArray(options)){
    classes = options.map(trim).filter(Boolean);
  }else{
    classes = trim(options).split(/\. /).filter(Boolean);
  }
  return classes.join(' ');
}

function trim(s){
  return type.isString(s) ? s.trim(): '';
}

module.exports = className;
