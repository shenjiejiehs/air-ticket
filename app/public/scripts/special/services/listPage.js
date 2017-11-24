const Special = require('./special');
const router = require('../../utils/simpleRouter');

const listPage = {
  // constants
  gobackOpts: ['all', 'ow', 'rt'],
  cabinOpts: ['all', 'Y', 'FC'],
  cabinMapping: {
    Y: '经济舱',
    F: '头等舱',
    C: '商务舱'
  },

  error: null,

  tripDateVisible: false,
  org: '',
  orgName: '',
  dst: '',
  dstName: '',
  month: '',
  tag: '',

  region: 'china', // china | inter
  goback: 'all', // all | ow | rt
  cabin: 'all', // all | Y | FC

  sortBy: 'price', // price | rate

  refresh() {
    Object.assign(this, {
      region: 'china',
      goback: 'all',
      cabin: 'all',
      sortBy: 'price'
    });
    return Special.fetchList({
      org: this.org,
      dst: this.dst,
      month: this.month,
      tag: this.tag
    }).then(() => {
      if (Special.list.some(t => t.specialtype == '0')) {
        this.region = 'china';
      } else {
        this.region = 'inter';
      }
    });
  },

  fetchData(
    {
      dst = '',
      dstName = '',
      org = '',
      orgName = '',
      month = '',
      tag = '',
      cabin = 'all'
    } = {}
  ) {
    Object.assign(this, {
      tripDateVisible: false,
      org,
      orgName,
      dst,
      dstName,
      month: String(month),
      tag,
      cabin,
      region: 'china',
      goback: 'all',
      sortBy: 'price'
    });
    return Promise.all([
      Special.fetchCityMapping(),
      Special.fetchList({
        dst,
        org,
        month: String(month),
        tag
      }).then(
        () => {
          if (Special.list.some(t => t.specialtype == '0')) {
            this.region = 'china';
          } else {
            this.region = 'inter';
          }
          this.error = null;
        },
        e => {
          this.error = e;
        }
      )
    ]);
  }
};

module.exports = listPage;

router.on('afterLeave', 'special/list', () => {
  module.exports.tripDateVisible = false;
});
