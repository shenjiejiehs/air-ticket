var m = require('m-react');
var Header = require('components/header');
var Accordion = require('components/accordion');

module.exports = m.createComponent({
  title: '组件测试：数字选择器',
  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),
      m('.hl-separator'),
      m(Accordion, {
        title: '预订和后续服务相关说明',
        content: '更改条件：航班起飞前2小时(含)之前，收取票面价10%(126元)变更费；航班起飞前2小时之后，收取票面价20%(252元)变更费。改期与升舱同时发生时，同时收取变更费与舱位差价 退票条件：航班起飞前2小时(含)之前，收取票面价20%(252元)退票费；航班起飞前2小时之后，收取票面价30%(378元)退票费 签转条件：不允许签转'
      })
    ]);
  }
});
