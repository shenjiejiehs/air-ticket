var Promise = require('utils/promise/timeout');
//var wx = require('utils/weixin');
var nativeApi = require('shared/native-api');
var TIMEOUT = 10000;

function timeoutPromise(promise){
  return Promise.timeout(TIMEOUT, promise);
}

function getCoords(){
  //var ret = ua.isWechat() ? getWxCoords() : getNativeCoords();
  var ret = getNativeCoords();
  return timeoutPromise(ret['catch'](getWebCoords));
}


function getWebCoords(){
  return new Promise(function (resolve, reject){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position){
        resolve({
          geolat: position.coords.latitude,
          geolon: position.coords.longitude,
          range: position.coords.accuracy
        });
      }, function (error){
        reject(error);
      }, {
        enableHighAccuracy: true,
        timeout: TIMEOUT, //set geo location timeout
        maximumAge: 1000 * 60 * 60 //cache one hour
      });
    }else{
      reject();
    }
  });
}

// function getWxCoords(){
//   return new Promise(function(resolve, reject){
//     wx.init().then(function (){
//       wx.getLocation({
//         success: function (res){
//           resolve({
//             geolat: res.latitude,
//             geolon: res.longitude,
//             range: res.accuracy
//           });
//         },
//         cancel: function (error) {
//           reject(error);
//         },
//         fail: function (err){
//           reject(err);
//         }
//       });
//     });
//   });
// }

function supportedNativeApi(){
  return nativeApi.invoke('isSupported', {method: 'getCurrentPosition'})
  .then(function (result){
    if(result.value !== '0'){
      return true;
    }
    throw new Error('[supportedNativeApi] false');
  });
}

function getNativeCoords(){
  return supportedNativeApi()
    .then(nativeApi.invoke.bind(nativeApi, 'getCurrentPosition'))
    .then(function (data){
      if(data && data.latitude){
        return {
          geolat: data.latitude,
          geolon: data.longitude,
          range: 100
        };
      }
      throw new Error('[getCurrentPosition] failed!');
    });
}

module.exports = {
  getCoords: getCoords
};
