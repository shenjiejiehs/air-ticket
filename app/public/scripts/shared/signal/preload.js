var modsQueue = [];
var loadModTimer = null;
module.exports = function(signal){
  signal.on('preload', onPreload);
};

function onPreload(payload){
  if(loadModTimer != null){
    clearTimeout(loadModTimer);
  }
  loadModTimer = setTimeout(function(){
    _inQueue([].concat(payload));
    if(modsQueue.length > 0){
      requireAsync(modsQueue.slice(0));
    }
    modsQueue.length = 0;
    loadModTimer = null;
  }, 1);
}

function _inQueue(mods){
  for(var i = 0, l = mods.length; i < l; i++){
    if(modsQueue.indexOf(mods[i]) === -1){
      modsQueue.push(mods[i]);
    }
  }
}
