const fetch = require('../../utils/fetch');
const compose = require('../../utils/compose');
const { pick, log, loading, fake } = require('../../utils/decorators');
const Special = require('./special');
const { resolve } = require('../../utils/simpleRouter');

const api = {
  fetchHotCities: compose(loading(), log('fetchHotCities'), pick())((options = {
  }) => fetch.get(resolve('api/base/hotCities'), options)),

  searchCities: compose(log('cities'), pick())((options = {}) =>
    fetch.get(resolve('api/base/cities'), options)
  )
};

const SelectDestPage = {
  resolve: null,
  reject: null,

  hotCities: null,

  type: 'org',
  search: '',
  searchResult: [],
  searchTimer: null,

  isSearching: false,
  fetchResult() {
    const search = this.search.toLowerCase();
    return api.searchCities({ search }).then(list => {
      this.searchResult = list;
    });
  },

  fetchHotCities(options = {}) {
    return Promise.resolve(
      this.hotCities || api.fetchHotCities(options)
    ).then(result => {
      // TODO 过滤联合机场
      this.hotCities = result;
      return result;
    });
  },

  fetchData({ type, resolve, reject } = {}) {
    Object.assign(this, {
      type,
      search: '',
      resolve,
      reject,
      searchResult: [],
      searchTimer: null,
      isSearching: false
    });

    return Promise.all([this.fetchHotCities(), Special.fetchCityFuzzy()]).catch(
      reject
    );
  }
};

module.exports = SelectDestPage;
