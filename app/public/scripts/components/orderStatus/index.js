const m = require('m-react');

require('./index.css');

const ORDER_STATUS = {
  '1': {
    title: '未支付',
    style: 'pending'
  },
  '2': {
    title: '已支付',
    style: 'paid'
  },
  '3': {
    title: '已取消',
    style: 'canceled'
  },
  '4': {
    title: '已退单',
    style: 'canceled'
  }
};

module.exports = m.createComponent({

  render(props, state) {

    let status = ORDER_STATUS[props.status] || {};

    return m(`.order-status.${status.style}.hl-box-border`, [
      m('.status.hl-text-lg', status.title || ''),
      m('.detail.hl-text-sm.hl-text-gray', props.detail || '')
    ]);
  }
});


// helper

function toRemaining(date) {
  let remainInSec = Math.max(0,
    Math.floor((date.valueOf() - (new Date()).valueOf()) / 1000)
  );
  let hour, minute, second;
  let pad = num => ((num < 10 ? '0' : '') + num);
  hour = Math.floor(remainInSec / (60 * 60));
  remainInSec = remainInSec % (60 * 60);
  minute = Math.floor(remainInSec / 60);
  second = remainInSec % 60;
  return (hour ? `${pad(hour)}:` : '') + `${pad(minute)}:${pad(second)}`;
}

function equal(a, b) {
  if (!a || !b) {
    return false;
  }
  return Object.keys(a).every(key => {
    if (a[key] instanceof Date) {
      return a[key].valueOf() === b[key].valueOf();
    } else {
      return a[key] === b[key];
    }
  });
}
