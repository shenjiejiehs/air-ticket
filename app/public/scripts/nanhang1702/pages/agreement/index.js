const m = require('m-react');
const Header = require('components/header');
const injectCtrls = require('modules/mixins/injectCtrls');
const agreementPage = require('../../substores/agreementPage');
const map = require('utils/map');

require('./index.css');

const controllers = { agreementPage };
const view = {
  title: '南航周末美食游',
  selectors: map((_, name) => name)(controllers),
  facets: {},
  render: function() {
    return m('.nanhang1702-agreement', [
      m(Header, { title: this.title }),
      m(
        '.agreement.hl-box-border-none', { style: { background: 'transparent' } }, [
          m('.hl-text-center.hl-text-lg', '《周末美食游退改说明》'),
          m(
            'ol.hl-text-sm.hl-text-gray',
            `
1.本产品为特价打包产品，若所选日期的航班舱位售罄，本站将为您推荐其他可用的出行日期。您亦可于此时申请退款，款项到账时间由银行结算周期决定（约2-15个工作日）。
2.航班出发时间请以最终票面确认信息为准；如遇航班变动，南航有权更改航班，协调并及时作出通知。行程变动或会产生费用，具体以客服确认为准。
3.产品在成功预订后，如因航班临时取消及延误造成包括：行程，酒店，餐饮，车辆的延误及失效，或因个人原因需更改行程，可自行联系调整订单，行程变更（酒店升级，天数增加等）所产生的额外费用，则需要另行支付。
4.若旅客与客服已在电话沟通中确认行程，视为已预约行程，未成功预约行程的，可申请全额退款；已成功预约行程的，不得退款。
5.酒店一旦预订成功，不得退订与变更。
6.酒店退房&入住时间： 12:00以前退房，15:00以后入住。`
            .trim().split(
              /\n/g
            ).map(term => m('li.term', term.replace(/^\d+\./, '')))
          )
        ]
      )
    ]);
  }
};

module.exports = m.createComponent(view, [injectCtrls(controllers)]);
