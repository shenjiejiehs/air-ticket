const wechat = require('./wechatHelper');
const nativeApi = require('./nativeApi');
const request = require('./request');
const env = require('../utils/env');
const router = require('./simpleRouter');

module.exports = { getNearbyCities, getCoords };

/**
 * @returns cities [{city, code, distance, geolat, geolon}]
 */
function getNearbyCities() {
  // return request({  // DEBUG 北京
  //   url: router.resolve('api/location/nearbyCities'),
  //   data: {
  //     geolat: Number(39.9042),
  //     geolon: Number(116.4074),
  //     range: (Number(100) || 100) / 1000
  //   }
  // });
  return getCoords().then(({ latitude, longitude, accuracy }) =>
    request({
      url: router.resolve('api/location/nearbyCities'),
      data: {
        geolat: Number(latitude),
        geolon: Number(longitude),
        range: (Number(accuracy) || 100) / 1000
      }
    })
  );
}

/**
 * @returns geolocation  {latitude, longitude, accuracy}
 */
function getCoords() {
  return env().then(({ browser }) => {
    if (browser === 'gtgj' || browser === 'hbgj') {
      return getCoordsByNativeAPI().catch(e => getCoordsByWeb());
    } else if (browser === 'wechat') {
      return getCoordsByWechat().catch(e => getCoordsByWeb());
    } else {
      return getCoordsByWeb();
    }
  });
}

function getCoordsByWeb() {
  console.info('[location] getting by web');
  return new Promise(function(resolve, reject) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          resolve(position.coords);
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 30000, // geolocation timeout
          maximumAge: 1000 * 60 * 60 // cache one hour
        }
      );
    } else {
      reject(new Error('geolocation not supported'));
    }
  });
}

function getCoordsByWechat() {
  console.info('[location] getting by wechat');
  return wechat.getLocation({
    type: 'wgs84'
  });
}

function getCoordsByNativeAPI() {
  console.info('[location] getting by nativeApi');
  return nativeApi.invoke('getCurrentPosition');
}
