const request = require('utils/request');
const pick = require('../../../../common/l/pick');
const { log, fake, loading, catchError } = require('./helper');
const compose = (...fns) =>
  arg => fns.reverse().reduce((prev, cur) => cur(prev), arg);
const url = url => (window.url_base || '') + url;

const api = {
  // 基础数据
  baseData: {
    load: () =>
      request({ url: url('api/base/data/get'), method: 'GET' }).then(result => {
        // 证件类型选项
        const idtype = pick('data.cards.ls.it', result).map(option => {
          return {
            type: option.type,
            name: option.n,
            desc: option.n,
            value: option.id
          };
        });
        // 乘机人类型选项
        const passtype = pick('data.psgtypels.ls.it', result).map(option => {
          return {
            name: option.n,
            desc: option.n,
            value: option.v,
            disabled: option.a == '0'
          };
        });

        return { idtype: idtype, passtype: passtype };
      })
  },
  // 获取中文拼音
  pinyin: chinesename =>
    request({
      url: url('api/user/pinyin'),
      method: 'GET',
      data: { name: chinesename }
    }).then(result => {
      return { pinyin: [].concat(result.pinyin).filter(Boolean) };
    }),
  // 乘机人
  passenger: {
    load: (data = {}) =>
      request({
        url: url('api/user/passenger/load'),
        method: 'GET',
        data: { countrytype: data.type || 'domestic' }
      }).then(result => {
        return [].concat(result.pslist && result.pslist.ps).filter(Boolean);
      }),
    add: passenger =>
      request({
        url: url('api/user/passenger/add'),
        method: 'POST',
        data: { info: JSON.stringify(passenger) }
      }),
    modify: passenger =>
      request({
        url: url('api/user/passenger/modify'),
        method: 'POST',
        data: { info: JSON.stringify(passenger) }
      }),
    delete: passenger =>
      request({
        url: url('api/user/passenger/delete'),
        method: 'POST',
        data: { info: JSON.stringify(passenger) }
      })
  },
  // 联系人/邮寄地址
  contact: {
    load: () =>
      request({
        url: url('api/user/contact/load'),
        method: 'GET'
      }),
    add: contact =>
      request({
        url: url('api/user/contact/add'),
        method: 'POST',
        data: { info: JSON.stringify(contact) }
      }),
    modify: contact =>
      request({
        url: url('api/user/contact/modify'),
        method: 'POST',
        data: { info: JSON.stringify(contact) }
      }),
    delete: contact =>
      request({
        url: url('api/user/contact/delete'),
        method: 'POST',
        data: { info: JSON.stringify(contact) }
      })
  },
  // 发票
  invoice: {
    load: () =>
      request({
        url: url('api/user/invoice/load'),
        method: 'GET'
      }),
    modify: invoice =>
      request({
        url: url('api/user/invoice/modify'),
        method: 'POST',
        data: { info: JSON.stringify(invoice) }
      })
  },
  // 电子邮件
  email: {}
};

module.exports = {
  baseData: {
    load: compose(loading(), log('baseData.load'))(api.baseData.load)
  },
  pinyin: compose(loading(), log('pinyin'))(api.pinyin),
  passenger: {
    load: compose(loading(), log('passenger.load'))(api.passenger.load),
    add: compose(loading(), log('passenger.add'))(api.passenger.add),
    modify: compose(loading(), log('passenger.modify'))(api.passenger.modify),
    delete: compose(loading(), log('passenger.delete'))(api.passenger.delete)
  },
  contact: {
    load: compose(loading(), log('contact.load'))(api.contact.load),
    add: compose(loading(), log('contact.add'))(api.contact.add),
    modify: compose(loading(), log('contact.modify'))(api.contact.modify),
    delete: compose(loading(), log('contact.delete'))(api.contact.delete)
  },
  invoice: {
    load: compose(loading(), log('invoice.load'))(api.invoice.load),
    modify: compose(loading(), log('invoice.modify'))(api.invoice.modify)
  }
};
