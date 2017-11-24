const m = require('m-react');
const injectCtrls = require('modules/mixins/injectCtrls');
const Header = require('components/header');
const map = require('utils/map');
const datetime = require('utils/datetime');

const bookPage = require('../../substores/bookPage');
const productService = require('../../substores/productService');

const ListCard = require('../../components/listCard');
const ContactInfo = require('components/contactInfo');
const PassengerInfo = require('components/passengerInfo');
const PriceBar = require('components/priceBar');

const controllers = { bookPage, productService };
require('./index.css');

const ProductItem = ({ icon, title, content }) =>
  m('.product-item.fx-col', [
    m('.fx-center', [
      m(`.icon.${icon}`),
      m('.fx-1.hl-text-24.hl-text-gray', title)
    ]),
    m('.product-content', content)
  ]);

const FlightItem = ({ flight, type }) =>
  ProductItem({
    icon: type,
    title: `${flight.fdate} ${datetime.formatWeek(flight.fdate)} ${{ outbound: '出发', inbound: '返回' }[type]}`,
    content: m('.fx-col', [
      m('.hl-text-24', `${flight.four} ${flight.no}`),
      m('.fx-center', [
        m('.fx-col', [
          m('.hl-text-34', flight.st),
          m('.hl-text-28', flight.dcty),
          m('.hl-text-22.hl-text-gray', flight.dport)
        ]),
        m('.fx-1.fx-center', m('.icon.arrow')),
        m('.fx-col.hl-text-right', [
          m('.hl-text-34', flight.et),
          m('.hl-text-28', flight.acty),
          m('.hl-text-22.hl-text-gray', flight.aport)
        ])
      ])
    ])
  });

const HotelItem = ({ hotel, nights, checkin, checkout, onView }) =>
  ProductItem({
    icon: 'hotel',
    title: m('.fx-row', [
      m('.fx-1', `${checkin} 至 ${checkout}`),
      `共入住${nights}晚`
    ]),
    content: m('.fx-col', [
      m('.fx-center', [
        m('.hl-text-24.fx-1', hotel.name),
        hotel.url &&
        m('.fx-center', { onclick: onView }, [
          m('.hl-text-blue.hl-text-xs', '详情'),
          m('.icon.arrow-right')
        ])
      ])
    ])
  });

const view = {
  title: '南航周末美食游',
  selectors: map((_, name) => name)(controllers),
  facets: {},
  render: function(props, { bookPage, productService }) {
    const {
      deadline,
      hotel,
      nights,
      inbound,
      outbound,
      price,
      stock,
      agreement
    } = productService;
    const { passengers, contact, agreed } = bookPage;
    const pageTitle = outbound && inbound ?
      `${outbound.dcty}-${inbound.dcty}` :
      '南航周末美食游';


    return m('.nanhang1702-book', [
      m(Header, { title: pageTitle }),
      deadline && new Date().valueOf() > deadline ?
      m('.placeholder.fx-center.hl-text-gray', '抱歉，本套餐已过预订截止日期') :
      stock == null ?
      m('.placeholder.fx-center.hl-text-gray', '套餐加载失败，请重试') :
      stock == 0 ?
      m('.placeholder.fx-center', '抱歉，本套餐已售完') :
      stock < 5 ?
      m('.placeholder.fx-center.hl-text-orange', '本套餐余量紧张，请抓紧抢购') :
      null,
      inbound && outbound && hotel && [
        ListCard({
          shadow: true,
          list: [
            FlightItem({ flight: outbound, type: 'outbound' }),
            HotelItem({
              hotel,
              checkin: outbound.fdate,
              checkout: inbound.fdate,
              nights,
              onView: () => this.signal('productService.goViewHotel')()
            }),
            FlightItem({ flight: inbound, type: 'inbound' })
          ]
        }),
        stock && new Date().valueOf() < deadline && [
          m(PassengerInfo, {
            passengers,
            onDelete: passengers =>
              this.signal('bookPage.input')({
                key: 'passengers',
                value: passengers
              }),
            onAdd: this.signal('bookPage.addPassenger')
          }),
          m('.hl-separator'),
          m(ContactInfo, {
            name: contact.name,
            phone: contact.phone,
            onInput: ({ key, value }) =>
              this.signal('bookPage.input')({ key, value }),
            onChooseContact: ({ name, phone }) =>
              this.signal('bookPage.input')({
                key: 'contact',
                value: { name, phone }
              })
          }),
          m(
            '.agreement.hl-box-border-none.hl-text-xs.hl-text-gray', { style: { background: 'transparent' } }, [
              m('.agreement-title', '预订须知'),
              m(
                'ol',
                agreement
                .split(/\n/)
                .map(
                  term =>
                  m('li.agreement-term', term.replace(/^\d+\./, ''))
                )
              ),
              m(
                '.fx-center.hl-text-xs.hl-text-gray', { onclick: this.signal('bookPage.toggleAgree') }, [
                  m(
                    '.icon.hl-margin-right' +
                    (agreed ? '.selected' : '.unselected')
                  ),
                  m('', '已阅读并同意'),
                  m(
                    '.hl-text-blue', { onclick: this.signal('bookPage.goViewAgreement') },
                    '《周末美食游协议》'
                  )
                ]
              )
            ]
          ),
          m(PriceBar, {
            totalPrice: stock ? price * passengers.length : 0,
            btnText: '立即抢购',
            isAvail: stock > 0,
            onSubmit: this.signal('bookPage.submit')
          })
        ]
      ]
    ]);
  }
};

module.exports = m.createComponent(view, [injectCtrls(controllers)]);
