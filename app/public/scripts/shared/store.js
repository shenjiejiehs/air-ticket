var createStore = require('modules/createStore');

var appCfg = require('../config');

var sessData;

if(window.sessionStorage && typeof window.sessionStorage.getItem === 'function'){
  try{
    sessData = JSON.parse(sessionStorage.getItem(appCfg.storageKey));
  }catch(e){
    console.log(e);
    sessData = null;
  }
}

module.exports = createStore(sessData||{}, {}, {
  storageKey: appCfg.storageKey
});
