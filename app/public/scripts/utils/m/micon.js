var m = require('m-react');
require('image/app.svg');
module.exports = function useSvg(name, style, classNames){
  style = style || '';
  if(style && typeof style === 'object'){
    var styles = Object.keys(style).reduce(function(s, styName){
        s.push(styName + ':' + style[styName]);
      return s;
    },[]);
    style = styles.join(';');
  }

  var classes = 'svg svg-' + name;
  if(typeof classNames === 'string' && classNames.trim().length > 0){
    classes += ' ' + classNames;
  }

  return m.trust(
    '<svg pointer-events="none" class="' + classes + '" style="'+style+'">\
      <use xlink:href="#'+name+'"/>\
    </svg>');
};
