const Special = require('./special');

module.exports = {
  cabinMapping: {
    Y: '经济舱',
    F: '头等舱',
    C: '商务舱'
  },

  from: 0,
  to: 0,
  barPlotHeight: 1,

  loading: false,
  org: '',
  dst: '',
  month: '',
  goback: 'ow',

  selected: null,

  isLeaving: false,
  thirdParty: '',

  fetchData(options = {}) {
    let {
      org,
      dst,
      month,
      goback,
      selected,
      from,
      to,
      selectedPrice,
      extra
    } = options;

    if (extra) {
      try {
        extra = typeof extra === 'string' ? JSON.parse(extra) : extra;
      } catch (error) {
        console.error('error parse extra', error);
      }
    }

    if (extra && extra.dateinterval) {
      let parsed;
      try {
        parsed = JSON.parse(extra.dateinterval);
      } catch (error) {
        console.error('error parse dateinterval', error);
      }
      if (parsed) {
        from = parsed.min;
        to = parsed.max;
      }
    }

    Object.assign(this, {
      from: from || 0,
      to: to || 0,
      barPlotHeight: 1,

      loading: false,
      org: org || '',
      dst: dst || '',
      month: month || '',
      goback: goback || 'ow',

      isLeaving: false,
      thirdParty: ''
    });

    return Promise.all([
      Special.fetchCityMapping(),
      Special.fetchDetail(
        Object.assign(
          {
            dst,
            org,
            month,
            goback
          },
          goback === 'rt' && {
            dateinterval: JSON.stringify({ min: 1, max: 15 })
          },
          extra || {}
        )
      )
    ]).then(() => {
      this.resetSelected(selected, selectedPrice);
    });
  },

  refresh() {
    return Special.fetchDetail(
      Object.assign(
        {
          dst: this.dst,
          org: this.org,
          month: this.month,
          goback: this.goback
        },
        this.goback === 'rt' && {
          dateinterval: JSON.stringify({
            min: this.from || 1,
            max: this.to || 15
          })
        }
      )
    ).then(() => {
      this.resetSelected();
    });
  },

  resetSelected(selected, selectedPrice) {
    let flights = (Special.detail.datas.content || [])
      .reduce((prev, cur) => prev.concat(cur.m_content), []);
    this.selected = null;
    // 按选中的日期高亮
    if (selected) {
      let i = 0;
      while (i < flights.length && flights[i].date !== selected) {
        i++;
      }
      this.selected = flights[i];
    }
    // 按选中的价格高亮
    if (!this.selected && selectedPrice) {
      let i = 0;
      while (
        i < flights.length &&
        Number(flights[i].price) != Number(selectedPrice)
      ) {
        i++;
      }
      this.selected = flights[i];
    }
    // 高亮最低价
    if (!this.selected) {
      flights = flights.sort((a, b) => a.price - b.price);
      this.selected = flights[0];
    }
  }
};
