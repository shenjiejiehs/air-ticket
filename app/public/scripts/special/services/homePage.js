const special = require('./special');
const router = require('../../utils/simpleRouter');

module.exports = {
  cabinMapping: {
    Y: '经济舱',
    F: '头等舱',
    C: '商务舱'
  },
  curTab: 0,
  curCityPrompt: false,
  tripDateVisible: false,
  fetchData({ curTab = 0 } = {}) {
    Object.assign(this, {
      curCityPrompt: false,
      tripDateVisible: false,
      curTab
    });
    return Promise.all([
      special.fetchHome(),
      special.fetchCityMapping(),
      special.fetchRecommendChina(),
      special.fetchRecommendInter()
    ]);
  }
};

router.on('afterLeave', 'special', () => {
  module.exports.tripDateVisible = false;
});
