/**
 * 组件测试: 订单概要卡片
 */
const m = require('m-react');
const Header = require('components/header');
const orderBrief = require('./index');

const order = {
  'orderId': '170131149811927',
  'phoneId': 412347,
  'name': '梅县往返机票+2晚星级酒店',
  'productId': 47,
  'totalPrice': 699,
  'status': 11,
  'statusStr': '关闭订单',
  'statusColor': '86,187,0,1',
  'desc': '南航周末美食游',
  'payTitle': '双十一机票',
  'createtime': '2017-01-13 11:49:54',
  'updatetime': '2017-01-13 12:00:00',
  'expiretime': '2017-01-13 11:59:53',
  'extdata': {
    'passengers': [ { 'id': 292, 'name': '王丛伟' } ],
    'product': {
      'id': '115',
      'hotel': {
        'name': '梅州华美达酒店',
        'url': 'https://hotel.rsscc.cn/index.html?test=hljd#detail/752300'
      },
      'nights': 2,
      'inbound': {
        'four': '南方航空',
        'no': 'CZ3338',
        'fdate': '2017-03-12',
        'scode': 'MXZ',
        'ecode': 'CAN',
        'dcty': '梅县',
        'dport': '梅县机场',
        'acty': '广州',
        'aport': '白云机场',
        'shz': '',
        'ehz': 'B区',
        'st': '22:40',
        'et': '23:45',
        'ts': '计划',
        'fid': '0',
        'ni': '0',
        'ds': '1'
      },
      'outbound': {
        'four': '南方航空',
        'no': 'CZ3337',
        'fdate': '2017-03-10',
        'scode': 'CAN',
        'ecode': 'MXZ',
        'dcty': '广州',
        'dport': '白云机场',
        'acty': '梅县',
        'aport': '梅县机场',
        'shz': 'B区',
        'ehz': '',
        'st': '20:55',
        'et': '21:50',
        'ts': '计划',
        'fid': '0',
        'ni': '0',
        'ds': '1'
      },
      'price': 699,
      'stock': 7,
      'agreement': '1.本产品需二次确认。请买家拍下产品前先向客服确认好您的出行日期。未经联系客服直接拍下并付款的订单均属无效，因而对买家出行安排所产生的影响，本店不承担任何责任及赔偿。\n2.本产品需提前17天预订，占床儿童与成人同价。\n3.本产品必须双人起订，如单人入住酒店需补差371元/人/晚。\n4.由于圣诞元旦期间酒店有可能在不提前通知的情况下调整价格，所以我们保留圣诞元旦期间价格调整的权利；\n5.本产品解释权归南航指定合作旅行社所有，如有疑问，请咨询客服csnholiday@csair.com\n6.如发生但不限于酒店升级、延住、单人入住等补差情况，需另行补交费用的，联系客服协调。',
      'outboundBrief': {
        'date': '2017-03-10',
        'depCity': '广州',
        'arrCity': '梅县',
        'no': 'CZ3337'
      },
      'inboundBrief': {
        'date': '2017-03-12',
        'depCity': '梅县',
        'arrCity': '广州',
        'no': 'CZ3338'
      },
      'product': {
        'id': null,
        'hotel': null,
        'nights': null,
        'inbound': null,
        'outbound': null,
        'price': null,
        'stock': null,
        'agreement': null
      },
      'order': null
    },
    'phone': '15927678147'
  },
  'detailUrl': 'https://wtest.133.cn/store/ticketHotel/orderDetail?orderid=170131149811927&sid=2372A8E2',
  'notwait': 0,
  'showColor': 0,
  'uid': '10000'
};
const style = ' ';

module.exports = m.createComponent({
  title: '组件测试: 订单概要卡片',
  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),
      orderBrief({ order })
    ]);
  }
});
