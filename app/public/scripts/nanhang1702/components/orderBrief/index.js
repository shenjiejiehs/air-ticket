/**
 * 订单概要卡片
 */
const m = require('m-react');
require('./index.css');
require('css/flex.css');
const Card = require('components/card');

module.exports = function(
  { order: { extdata: { product, phone, passengers }, name } }
) {
  const { outbound, inbound, hotel, nights } = product;
  return Card({
    title: m('.order-brief-title', name),
    content: m('.order-brief-content.hl-text-sm.hl-text-gray', [
      m('.order-brief-section', [
        m('.order-brief-item', [
          m('.fx-v-center', [
            m('.icon.outbound'),
            m('.fx-1', `${outbound.fdate} ${outbound.st}`),
            m('', `${outbound.dcty} 出发`)
          ])
        ]),
        m('.order-brief-item', [
          m('.fx-v-center', [
            m('.icon.inbound'),
            m('.fx-1', `${inbound.fdate} ${inbound.st}`),
            m('', `${inbound.dcty} 返回`)
          ])
        ]),
        m('.order-brief-item', [
          m('.fx-v-center', [
            m('.icon.hotel'),
            m('.fx-1', `${hotel.name} 入住${nights}晚`)
          ])
        ])
      ]),
      m('.order-brief-section', [
        m('.order-brief-item.passengerk.fx-row', [
          m('.fx-1', `旅客人数: ${passengers.length}`),
          phone
        ])
      ])
    ]),
    shadow: true,
    hole: true,
    padding: false,
    divider: 'dashed'
  });
};
