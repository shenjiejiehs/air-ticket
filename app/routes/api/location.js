const router = require('express').Router();
const hbgjSystem = require('./../../lib/api/hbgjSystem');
const { airportsByCode } = require('../../lib/api/airports');

const pipeline = require('./utils/pipeline');
const collect = require('./utils/collect');
const send = require('./utils/send');

/**
 * 查找附近的城市
 * @param {geolon, geolat, range}
 * @return City[]  距离近的排在前面
 */
router.get(
  '/nearbyCities',
  pipeline([collect(), hbgjSystem.airport.nearby, toCity, send()])
);

module.exports = router;

function toCity(result) {
  return airportsByCode.then(airports => {
    try {
      result.data = result.data.list
        .slice(0, 10)
        .sort((a, b) => a.distance - b.distance)
        .map(item => {
          if (item.code && airports[item.code]) {
            item.city = airports[item.code]; // 机场信息包含城市信息
          }
          return item;
        });
      return result;
    } catch (error) {
      result.error = error;
      throw result;
    }
  });
}
