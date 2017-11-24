const m = require('m-react');
require('./index.css');

const cabinMapping = {
  Y: '经济舱',
  F: '头等舱',
  C: '商务舱'
};

module.exports = ({ tripList, cityMapping, onSelect }) =>
  m(
    '.trip-list',
    tripList.map(t =>
      m(
        '.trip-wrapper',
        m(
          '.trip.fx-col.fx-c-center.fx-m-between' +
            (t.sale_status == 0 ? '.soldout' : ''),
          {
            onclick: () => onSelect(t)
          },
          [
            m('.month.fx-center.hl-text-22', `${t.month}月`),
            m(
              '.dep-arr.hl-text-28',
              `${cityMapping[t.org] || t.org}-${cityMapping[t.dst] || t.dst}`
            ),
            m(
              '.goback-cabin.hl-text-22',
              [{ ow: '单程', rt: '往返' }[t.goback], cabinMapping[t.gobct]]
                .filter(Boolean)
                .join(' ')
            ),
            m(
              '.discount.hl-text-22',
              [
                { ow: '', rt: '往返' }[t.goback] +
                  { 0: '', 1: '含税总价' }[t.specialtype],
                t.rate && `${Math.round(t.rate * 100) / 10}折`
              ]
                .filter(Boolean)
                .join(' ')
            ),
            m('.price', [
              m('span.hl-text-22', '￥'),
              m(
                'span.hl-text-32',
                { 0: t.price, 1: t.totalprice }[t.specialtype]
              )
            ])
          ]
        )
      )
    )
  );
