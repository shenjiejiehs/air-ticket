var m = require('m-react');
var cx = require('utils/m/className');
var dtUtil = require('utils/datetime');
var getCalendar = require('utils/calendar');
var findUtil = require('common/l/find');

var iconBack = require('components/header/back.svg');
require('./index.css');
require('css/flex.css');

const TODAY = dtUtil.TODAY;

module.exports = m.createComponent({
  defaultProps: {
    date: TODAY,
    onSelect: console.log.bind(console)
      /*   minDate: '2016-10-02',*/
      //maxDate: '2016-12-09',
      //isDateInvalide: function(){},
      //datePrice: [{
      //day: '2016-11-24',
      //price: 200
      /*}]*/
  },

  getInitialState() {
    let todayPrice = findUtil(d => dtUtil.compareDay(TODAY, d.day) === 0, this.props.datePrice || []);

    return {
      selectDate: this.props.date || TODAY,
      isTodayValid: isValid({
        minDate: this.props.minDate,
        maxDate: this.props.maxDate,
        isDateInvalid: this.props.isDateInvalid,
        dateItem: findUtil(d => dtUtil.compareDay(TODAY, d.day) === 0, this.props.datePrice || [])
      })
    };
  },


  onSelect(date) {
    this.setState({
      selectDate: date
    });

    if (this.props.onSelect && typeof this.props.onSelect === 'function') {
      this.props.onSelect(dtUtil.formatDate(date, true));
    }
  },

  render(props, state) {
    return m('.calendar-widget', [




      m('.banner.hl-text-xs.hl-border-bottom.fx-row', [
        '日', '一', '二', '三', '四', '五', '六'
      ].map(item => m('.fx-1.fx-center.hl-text-gray', item))),


      m('.calendar-wrapper.hl-text-center',
        CalendarBody.call(this)
      )
    ]);
  }
});

function CalendarBody() {
  let thisComponent = this;
  let props = thisComponent.props;
  let state = thisComponent.state;
  let calendarDoms = [];
  let minDate = props.minDate || props.date;
  let maxDate = getDateByMonth(props.maxDate, 0).lastDateInNextM;
  let dateItem = minDate;
  let datePrice = props.datePrice || [];

  do {
    let calendar = getCalendar(dateItem);

    calendarDoms.push(m('', [
      m('.cal-header.hl-border-bottom.hl-text-sm', `${calendar.year}年${calendar.month}月`),
      m('.cal-body.fx-row.fx-cl-around.fx-wrap', _organizeByWeek(calendar.days, calendar.firstDay).map(weekDays =>
        weekDays.map((day, index) => {
          let dateDetail = {};
          if (day) {
            dateDetail = findUtil(d => dtUtil.compareDay(day.date, d.day) === 0, datePrice);
          }

          return day ? DayCell({
            key: index,
            day: day,
            price: dateDetail && dateDetail.price ? dateDetail.price : 0,
            isActive: dtUtil.compareDay(day.date, thisComponent.state.selectDate) === 0,
            isToday: isToday(day.date),
            isValid: isValid({
              dateItem: dateDetail,
              minDate: props.minDate,
              maxDate: props.maxDate,
              isDateInvalid: props.isDateInvalid
            }),
            onSelect: thisComponent.onSelect
          }) : m('.cal-cell', { key: index });
        })))
    ]));

    dateItem = getDateByMonth(dateItem, 1).curDateInNextM;
  } while (dtUtil.compareDay(dateItem, minDate) >= 0 && dtUtil.compareDay(dateItem, maxDate) <= 0);

  return calendarDoms;
}

function DayCell(opts) {
  return m('.cal-cell.hl-border-bottom.hl-relative', {
    key: opts.key,
    evClick: opts.isValid ? opts.onSelect.bind(null, opts.day.date) : null,
    class: cx({
      'cal-day': opts.isValid,
      'cal-day-invalid': !opts.isValid,
      'cal-desc': opts.isToday || !!(opts.day.desc),
      'cal-active': opts.isActive
    })
  }, [
    m('.cal-cell__txt.fx-center.hl-text-xs',
      opts.isToday ?
      m('.hl-text-blue', '今天') :
      (opts.day.desc || m('.hl-text-md', opts.day.day))
    ),
    opts.price && m('.cal-cell__price.hl-text-xs.hl-text-gray', ('￥' + opts.price))
  ]);
}

function _organizeByWeek(days, firstDay) {
  var secondWeekdayIdx = 7 - firstDay,
    firsWeeks = days.slice(0, secondWeekdayIdx);
  var i = secondWeekdayIdx,
    l = days.length;
  var results = [_ensureSevenDays(firsWeeks, true)];
  while (i < l) {
    results.push(_ensureSevenDays(days.slice(i, i + 7)));
    i = i + 7;
  }
  return results;
}

function _ensureSevenDays(arr, addBefore) {
  if (arr.length >= 7) return arr;
  var addCount = 7 - arr.length;
  var result = arr.slice(0);
  for (var i = 0; i < addCount; i++) {
    result[addBefore ? 'unshift' : 'push'](null);
  }
  return result;
}

function getDateByMonth(date, delta) {
  date = dtUtil.parse(date);
  var year = date.getFullYear();
  var month = date.getMonth();
  var mdate = date.getDate(),
    lastDateOfM;

  month = month + delta;

  if (month > 11) {
    year = year + 1;
    month = month - 12;
  }
  if (month < 0) {
    year = year - 1;
    month = 12 + month;
  }

  lastDateOfM = (new Date(year, month + 1, 0)).getDate();

  if (lastDateOfM < mdate) {
    mdate = lastDateOfM;
  }

  let curDateInNextM = new Date(year, month, mdate);
  let lastDateInNextM = new Date(year, month, lastDateOfM);

  return { curDateInNextM, lastDateInNextM };
}

function isValid({ minDate, maxDate, isDateInvalid, dateItem = {} }) {
  let _compToMin = minDate ? dtUtil.compareDay(dateItem.day, minDate) >= 0 : true;
  let _compToMax = maxDate ? dtUtil.compareDay(dateItem.day, maxDate) <= 0 : true;
  let _isDateInvalid = isDateInvalid && typeof isDateInvalid == 'function' ? isDateInvalid(dateItem) : false;

  return _compToMin && _compToMax && !_isDateInvalid;
}

function isToday(date) {
  return dtUtil.compareDay(date, TODAY) === 0;
}
