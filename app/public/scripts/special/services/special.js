const fetch = require('../../utils/fetch');
const compose = require('../../utils/compose');
const { pick, log, loading, fake } = require('../../utils/decorators');
const { resolve } = require('../../utils/simpleRouter');

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

const api = {
  fetchHome: compose(loading(), log('queryHome'), pick())((option = {}) =>
    fetch.get(resolve('api/special/queryHome'), option)
  ),

  fetchList: compose(loading(), log('queryList'), pick())((options = {}) =>
    fetch.get(resolve('api/special/queryList'), options)
  ),

  fetchDetail: compose(loading(), log('queryDetail'), pick())((options = {}) =>
    fetch.get(resolve('api/special/queryDetail'), options)
  ),

  fetchMoreMessage: compose(
    loading(),
    log('queryMoreMessage'),
    pick()
  )((options = {}) =>
    fetch.get(resolve('api/special/queryMoreMessage'), options)
  ),

  fetchMessageDetail: compose(
    loading(),
    log('queryMessageDetail'),
    pick()
  )((options = {}) =>
    fetch.get(resolve('api/special/queryMessageDetail'), options)
  ),

  fetchCityWhiteList: compose(
    loading(),
    log('queryCityWhiteList'),
    pick()
  )((options = {}) =>
    fetch.get(resolve('api/special/queryCityWhiteList'), options)
  ),

  fetchCityFuzzy: compose(
    loading(),
    log('queryCityFuzzy'),
    pick()
  )((options = {}) =>
    fetch.get(resolve('api/special/queryCityFuzzy'), options)
  ),

  fetchCityMapping: compose(
    loading(),
    log('fetchCityMapping'),
    pick()
  )((options = {}) => fetch.get(resolve('api/base/cityMapping'), options)),

  fetchRecommend: compose(
    loading(),
    log('fetchRecommend'),
    pick()
  )((options = {}) => fetch.get(resolve('api/special/queryRecommend'), options))
};

const Special = {
  home: null,
  list: null,
  detail: null,
  promote: null,
  cityWhiteList: null,
  cityFuzzy: null,
  recommendChina: null,
  recommendInter: null,

  curCityCode: '',
  curCityName: '',

  cityMapping: null,

  fetchCityMapping(options = {}) {
    return Promise.resolve(
      this.cityMapping || api.fetchCityMapping(options)
    ).then(result => {
      this.cityMapping = result;
      for (var code in localToStandard) {
        if (localToStandard.hasOwnProperty(code)) {
          const stdCode = localToStandard[code];
          this.cityMapping[stdCode] = result[code];
        }
      }
      return result;
    });
  },

  fetchHome(options = {}) {
    return api.fetchHome(options).then(result => {
      this.home = result;
      return result;
    });
  },

  fetchList(options = {}) {
    return api.fetchList(options).then(result => {
      this.list = flattenList(result);
      return this.list;
    });
  },

  fetchDetail(options = {}) {
    return api.fetchDetail(options).then(result => {
      this.detail = result;
      return this.detail;
    });
  },

  fetchPromote(options = {}) {
    return api.fetchMessageDetail(options).then(result => {
      this.promote = result;
      return this.promote;
    });
  },
  reportPromote(options = {}) {
    return api.fetchMessageDetail(options).catch(error => {});
  },

  fetchCityWhiteList(options = {}) {
    return Promise.resolve(
      this.cityWhiteList || api.fetchCityWhiteList(options)
    ).then(result => {
      this.cityWhiteList = result;
      return result;
    });
  },

  fetchCityFuzzy(options = {}) {
    return Promise.resolve(
      this.cityFuzzy || api.fetchCityFuzzy(options)
    ).then(result => {
      this.cityFuzzy = result;
      return result;
    });
  },

  fetchRecommendChina() {
    return Promise.resolve(
      this.recommendChina || api.fetchRecommend({ specialtype: 0 })
    ).then(
      result => {
        this.recommendChina = result;
        return result;
      },
      e => {}
    );
  },

  fetchRecommendInter() {
    return Promise.resolve(
      this.recommendInter || api.fetchRecommend({ specialtype: 1 })
    ).then(
      result => {
        this.recommendInter = result;
        return result;
      },
      e => {}
    );
  }
};

module.exports = Special;

function flattenList(result) {
  const { china, inter } = result.datas;
  return []
    .concat(china, inter)
    .map(items => items && items.content)
    .filter(content => content && content.length)
    .reduce((prev, cur) => prev.concat(cur), []);
}
