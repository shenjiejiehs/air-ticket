const m = require('m-react');
const injectCtrls = require('modules/mixins/injectCtrls');
const Header = require('components/header');
const cx = require('utils/m/className');
const map = require('utils/map');

const orderDetailPage = require('../../substores/orderDetailPage');
const agreementPage = require('../../substores/agreementPage');
const orderService = require('../../substores/orderService');
const OrderBrief = require('../../components/orderBrief');
const PriceBar = require('components/priceBar');

require('./index.css');

const controllers = { orderDetailPage, orderService, agreementPage };

const view = {
  title: '订单详情',
  selectors: map((_, name) => name)(controllers),
  facets: {},
  render: function(props, { orderDetailPage, orderService }) {
    const { order } = orderService;
    const { brief } = orderDetailPage;
    if (brief && order && window.unblockLoad) {
      // 解决在客户端下动态获取网页高度的hack
      setTimeout(window.unblockLoad, 0);
    }
    return m(
      '.nanhang1702-order-detail',
      brief ?
      m(
        '.brief-wrapper', { style: { padding: '0.11rem 0' } },
        OrderBrief({ order: orderService.order })
      ) : [
        m(Header, { title: this.title }),
        m(
          '.hl-list-group',
          m('.hl-list-group-item', [
            m(
              '.hl-text-lg', { style: { color: `rgba(${order.statusColor})` } },
              order.statusStr
            )
          ])
        ),
        OrderBrief({ order: orderService.order }),
        order.extdata.passengers && [
          m('.hl-list-group', [
            m('.hl-list-group-item', [
              m('', order.name),
              m('.hl-text-xs.hl-text-gray', order.desc)
            ]),
            m('.hl-list-group-item', [
              m('', ['乘机人',
                m('span.hl-text-xs.hl-text-gray.hl-margin-left-sm', `共${order.extdata.passengers.length}人`)
              ]),
              order.extdata.passengers.map(({ itn, idcard, name }) =>
                m('.passenger-item', {
                  style: { padding: '0.1rem 0' }
                }, [
                  m('', name),
                  m('.hl-text-xs.hl-text-gray', {
                    style: {
                      'line-height': 1
                    }
                  }, `${itn} ${idcard}`)
                ])
              )
            ])
          ]),
          m('.hl-separator')
        ],
        m('.hl-list-group.hl-list-group-pl', [
          m('.hl-list-group-item', '订单信息'),
          m('.hl-list-group-item', [
            m('.fx-row.hl-text-sm', [
              m('.hl-text-gray', '订单编号'),
              m('.fx-1.hl-text-right', orderService.id)
            ]),
            m('.fx-row.hl-text-sm', [
              m('.hl-text-gray', '订单状态'),
              m('.fx-1.hl-text-right', order.statusStr)
            ]),
            m('.fx-row.hl-text-sm', [
              m('.hl-text-gray', '订单金额'),
              m('.fx-1.hl-text-right', `￥${order.totalPrice}`)
            ]),
            m('.fx-row.hl-text-sm', [
              m('.hl-text-gray', '预订时间'),
              m('.fx-1.hl-text-right', order.createtime)
            ])
          ])
        ]),
        m(
          '.hl-text-sm.hl-text-blue.hl-text-center.hl-margin-top', { onclick: this.signal('agreementPage.load') },
          '《周末美食游协议》'
        ),
        order.status == 0 &&
        m(PriceBar, {
          totalPrice: order.totalPrice,
          btnText: '立即支付',
          isAvail: true,
          onSubmit: this.signal('orderDetailPage.pay')
        })
      ]
    );
  }
};

module.exports = m.createComponent(view, [injectCtrls(controllers)]);
