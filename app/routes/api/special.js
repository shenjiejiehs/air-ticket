const router = require('express').Router();
const specialApi = require('../../lib/api/special');
const airportApi = require('../../lib/api/airports');

const pipeline = require('./utils/pipeline');
const collect = require('./utils/collect');
const addPhoneId = require('./utils/addPhoneId.js');
const send = require('./utils/send');

// 1.首页
router.get(
  '/queryHome',
  pipeline([
    collect(),
    addPhoneId({ required: false, key: 'uid' }),
    addFrom(),
    specialApi.queryHome,
    send()
  ])
);

// 2.列表页面
router.get(
  '/queryList',
  pipeline([
    collect(),
    addPhoneId({ required: false, key: 'uid' }),
    addFrom(),
    specialApi.queryList,
    send()
  ])
);

// 3.详情页
router.get(
  '/queryDetail',
  pipeline([
    collect(),
    addPhoneId({ required: false, key: 'uid' }),
    addFrom(),
    specialApi.queryDetail,
    send()
  ])
);

// 4.更多消息
router.get(
  '/queryMoreMessage',
  pipeline([
    collect(),
    addPhoneId({ required: false, key: 'uid' }),
    addFrom(),
    specialApi.queryMoreMessage,
    send()
  ])
);

// 5.消息详情
router.get(
  '/queryMessageDetail',
  pipeline([
    collect(),
    addPhoneId({ required: false, key: 'uid' }),
    addFrom(),
    specialApi.queryMessageDetail,
    send()
  ])
);

// 6.城市白名单
router.get(
  '/queryCityWhiteList',
  pipeline([
    collect(),
    addPhoneId({ required: false, key: 'uid' }),
    addFrom(),
    specialApi.queryCityWhiteList,
    send()
  ])
);

// 7.城市模糊词
router.get(
  '/queryCityFuzzy',
  pipeline([
    collect(),
    addPhoneId({ required: false, key: 'uid' }),
    addFrom(),
    specialApi.queryCityFuzzy,
    send()
  ])
);

// 8. 猜你喜欢
router.get(
  '/queryRecommend',
  pipeline([
    collect(),
    addPhoneId({ required: false, key: 'uid' }),
    addFrom(),
    specialApi.queryRecommend,
    send()
  ])
);

// 热门国内目的地
router.get(
  '/queryHotDomesticDests',
  pipeline([
    function() {
      return airportApi
        .findCities(
          city =>
            (city.dynamicTags.indexOf('热门') !== -1 ||
              city.searchTags.indexOf('热门') !== -1) &&
            city.countryCode === 'CHN'
        )
        .then(cities =>
          cities.sort(
            (a, b) => (Number(a.order) || 100) - (Number(b.order) || 100)
          )
        )
        .then(cities =>
          cities.map(city => {
            city.cityCode = airportApi.toStandardCityCode(city.cityCode);
            return city;
          })
        )
        .then(
          result => {
            return { data: result };
          },
          error => {
            const result = { error };
            throw result;
          }
        );
    },
    send()
  ])
);

module.exports = router;

function addFrom() {
  return (payload, req, res) => {
    let deviceInfo = req.session.deviceInfo || {};

    switch (deviceInfo.client) {
      case 'hbgj':
        payload.from = 'special_hbgj';
        break;
      case 'gtgj':
        payload.from = 'special_gtgj';
        break;
      case 'weixin':
        payload.from = 'special_weixin';
        break;
      default:
        payload.from = 'special_other';
    }

    return payload;
  };
}
