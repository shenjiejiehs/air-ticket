/**
 * 机场/城市信息查询
 * 机场信息数据结构:http://gitlab.qtang.net/luolj/hbgj-api/blob/master/4012.md
 */

const hbgj = require('./hbgj');

const airports = hbgj.base.data['4012']().then(normalize).catch(e => {
  console.error('[city-airport] basic data failed to load:');
  console.error(JSON.stringify(e, ' ', 2));
  process.exit(-1);
  throw e;
});

const citiesByCode = airports.then(list =>
  list.reduce((prev, cur) => {
    let city = prev[cur.cityCode];
    if (!city) {
      prev[cur.cityCode] = {
        cityName: cur.cityName,
        cityNameEn: cur.cityNameEn,
        cityNameAlias: cur.cityNameAlias,
        cityPinyin: cur.cityPinyin,
        cityPinyinInitials: cur.cityPinyinInitials,
        cityCode: cur.cityCode,

        cityAirportsName: cur.cityAirportsName,
        cityAirportsCode: cur.cityAirportsCode,
        provinceName: cur.provinceName,
        countryName: cur.countryName,
        countryCode: cur.countryCode,
        regionCode: cur.regionCode,

        searchTags: cur.searchTags,
        dynamicTags: cur.dynamicTags,
        order: cur.order,

        airports: [cur]
      };
    } else {
      if (cur.cityAirportsCode.indexOf('|') !== -1) { //  多机场的数据
        Object.assign(city, {
          cityName: cur.cityName,
          cityNameEn: cur.cityNameEn,
          cityNameAlias: cur.cityNameAlias,
          cityPinyin: cur.cityPinyin,

          cityPinyinInitials: cur.cityPinyinInitials,
          cityCode: cur.cityCode,

          cityAirportsName: cur.cityAirportsName,
          cityAirportsCode: cur.cityAirportsCode,
          provinceName: cur.provinceName,
          countryName: cur.countryName,
          countryCode: cur.countryCode,
          regionCode: cur.regionCode,

          searchTags: cur.searchTags,
          dynamicTags: cur.dynamicTags,
          order: cur.order
        });
      } else {
        city.airports.push(cur);
      }
    }
    return prev;
  }, {})
);

const airportsByCode = airports.then(list =>
  list.reduce((prev, cur) => {
    prev[cur.airportCode] = cur;
    return prev;
  }, {})
);

const cities = citiesByCode.then(records =>
  Object.keys(records).map(key => records[key])
);

const citiesMapping = cities.then(list =>
  list.reduce((prev, cur) => {
    if (cur && cur.cityCode && cur.cityName) {
      prev[cur.cityCode] = cur.cityName;
    }
    return prev;
  }, {})
);

const standardToLocal = {
  SIA: 'XIY',
  BJS: 'BJS_C',
  SHA: 'SHS_C',
  CKG: 'CQS_C'
};

const localToStandard = {
  XIY: 'SIA',
  BJS_C: 'BJS',
  SHS_C: 'SHA',
  CQS_C: 'CKG'
};

module.exports = {
  airports,
  airportsByCode,

  cities,
  citiesByCode,
  citiesMapping,

  // 根据任意条件搜索机场, 返回数组
  findAirports(predict) {
    return airports.then(list => list.filter(predict));
  },

  // 按机场三字码查找机场
  findAirportByCode(code) {
    return airportsByCode.then(map => map[code]);
  },

  // 根据任意条件搜索城市, 返回数组
  findCities(predict) {
    return cities.then(list => list.filter(predict));
  },

  // 按城市三字码查找城市
  findCityByCode(code) {
    return citiesByCode.then(map => map[code]);
  },

  // 本地接口的三字码有几个特殊的，和第三方不一致

  toLocalCityCode(cityCode) {
    return standardToLocal[cityCode] || cityCode;
  },

  // 本地接口的三字码有几个特殊的，和第三方不一致
  toStandardCityCode(cityCode) {
    return localToStandard[cityCode] || cityCode;
  }

  // Example: 查找热门城市
  // findHotCities() {
  //   return this.findCities(
  //     city =>
  //       city.dynamicTags.indexOf('热门') !== -1 ||
  //       city.searchTags.indexOf('热门') !== -1
  //   ).then(list => list.sort((a, b) => (a.order || 100) - (b.order || 100)));
  // }
};
// module.exports.cities.then(console.log);

// 某些城市三字码其实是机场三字码
const fixCityName = {
  SHA: '上海',
  PVG: '上海',
  PEK: '北京',
  NAY: '北京',
  CKG: '重庆',
  JIQ: '重庆'
};

const fixCityCode = {
  SHA: 'SHS_C',
  PVG: 'SHS_C',
  PEK: 'BJS_C',
  NAY: 'BJS_C',
  CKG: 'CQS_C',
  JIQ: 'CQS_C'
};
/**
 * 将国内/国外的数据标准化为 机场数据 列表，每条记录包含固定的字段，见代码
 * 特例：国内部分城市有多个机场（如北京上海），“多机场”数据会作为一条特殊的数据插入
 * 国外这种情况会拆分成多条机场数据
 */
function normalize(data) {
  let airports = [];

  let domesticData = data.data.airport.uct.ls.it;
  let internationalData = data.data.airport.international.ls.it;

  domesticData.forEach(entry => {
    airports.push({
      airportName: entry.ap || entry.dc || '',
      airportNameEn: '',
      airportNameAlias: entry.al || '',
      airportCode: entry.codes || entry.s || '',

      cityName: fixCityName[entry.s] || entry.n || '',
      cityNameEn: '',
      cityNameAlias: entry.cal || '',
      cityPinyin: entry.p || '',
      cityPinyinInitials: entry.j || '',
      cityCode: fixCityCode[entry.s] || entry.s || '', // 城市三字码，对于有多个机场的国内城市(如北京/上海)，这里是后端自己规定的特殊城市三字码(如BJS_C), 和第三方（如携程）的定义不同，要注意转换
      // 此外这种“联合机场”和单独的机场都在数据库中，也就是同时存在: PEK, NAY, PEK|NAY
      cityAirportsName: entry.dc || entry.ap || '', // 城市多个机场名，用|分隔
      cityAirportsCode: entry.codes || entry.s || '', // 城市多个机场三字码，用|分隔
      provinceName: entry.pe || '',
      countryName: entry.c || '',
      countryCode: entry.ccode || '',
      regionCode: entry.rcode || '',

      searchTags: entry.h || '',
      dynamicTags: entry.dh || '',
      order: entry.o || ''
    });
  });

  internationalData.forEach(city => {
    // 对于有多个机场的国外城市，我们还是分拆成多条机场数据吧
    [].concat(city.as.a).forEach(airport => {
      airports.push({
        airportName: airport.n || '',
        airportNameEn: airport.e || '',
        airportNameAlias: airport.al || '',
        airportCode: airport.s || '',

        cityName: city.n || '',
        cityNameEn: city.e || '',
        cityNameAlias: city.al || '',
        cityPinyin: city.p || '',
        cityPinyinInitials: city.j || '',
        cityCode: city.s || '',
        cityAirportsName: city.dc || airport.n || '', // 城市多个机场名，用|分隔
        cityAirportsCode: city.codes || airport.s || '', // 城市多个机场三字码，用|分隔
        provinceName: city.pe || '',
        countryName: city.c || '',
        countryCode: city.ccode || '',
        regionCode: city.rcode || '',

        searchTags: city.h || '',
        dynamicTags: city.dh || '',
        order: city.o || ''
      });
      airports;
    });
  });
  return airports;
}
