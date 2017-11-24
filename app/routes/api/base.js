const router = require('express').Router();

const hbgj = require('./../../lib/api/hbgj');

const pipeline = require('./utils/pipeline');
const collect = require('./utils/collect');
const send = require('./utils/send');
const { cities, citiesMapping } = require('../../lib/api/airports');

router.get('/data/get', pipeline([collect(), hbgj.base.data['4011'], send()]));

/**
 * 热门城市列表
 * @return City[]
 */
router.get(
  '/hotCities',
  pipeline([
    collect(),
    function(payload) {
      return cities.then(list =>
        list
        .filter(
          city =>
          (city.dynamicTags.indexOf('热门') !== -1 ||
            city.searchTags.indexOf('热门') !== -1) &&
          city.countryCode === 'CHN'
        )
        .sort((a, b) => (Number(a.order) || 100) - (Number(b.order) || 100)));
    },
    send()
  ])
);

/**
 * 搜索城市, 并按热门度排序
 * @param search 模糊搜索词
 * @return City[]
 */
router.get(
  '/cities',
  pipeline([
    collect(),
    function(payload) {
      let search = payload.search;
      if (search == null || search === '') {
        throw { msg: '请输入查询条件', statusCode: 400 };
      }

      search = search.toLowerCase();
      return cities.then(list =>
        list
        .filter(city => [
          city.cityName,
          city.cityNameAlias,
          city.citNameEn,
          city.cityPinyin,
          city.cityPinyinInitials
        ].some(
          field =>
          typeof field === 'string' &&
          field.toLowerCase().indexOf(search) === 0
        ))
        .sort((a, b) => (Number(a.order) || 100) - (Number(b.order) || 100))
        .slice(0, 50));
    },
    send()
  ])
);

/**
 * 城市三字码-城市名映射
 * @return {[code]: cityName}
 */
router.get(
  '/cityMapping',
  pipeline([
    function() {
      return citiesMapping;
    },
    send()
  ])
);
module.exports = router;
