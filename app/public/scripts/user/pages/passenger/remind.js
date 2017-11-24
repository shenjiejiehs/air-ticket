const m = require('m-react');
const injectCtrls = require('modules/mixins/injectCtrls');

const Header = require('components/header');
const services = require('../../services');

require('./remind.css');

module.exports = m.createComponent({
  title: '乘机人说明',

  render(props, state) {
    return m('#passenger-remind-page', [
      m(Header, { title: this.title }),

      m('.remind-content', [
        m('.hl-text-lg.hl-text-center', '乘机人要求与特殊旅客详细说明'),

        m('.hl-text-bold', '无成人陪伴儿童旅客'),
        m('p.hl-text-sm', '旅行开始之日已满两周岁但未满十二周岁旅客。 为保障服务品质和旅客安全，无成人陪伴儿童旅客须于航班起飞前至少48小时向航空公司申请无成人陪伴儿童服务。'),

        m('.hl-text-bold', '婴儿旅客'),
        m('p.hl-text-sm', '婴儿旅客是指出生14天至2周岁以下的婴儿，必须在有成年旅客陪伴方可乘机，婴儿按正常票价的10%购票，不单独占用座位。 婴儿旅客建议直接联系航空公司购买。'),

        m('.hl-text-bold', '孕妇旅客'),
        m('p.hl-text-sm', '怀孕不足8个月（32周）的孕妇乘机（医生诊断不适应乘机者除外），按一般旅客接受运输； 超过8个月(32周)(含)但不足9个月(36周)的健康孕妇有特殊情况需要乘机，应在乘机前72小时，开具医生诊断证明并联系航空公司购买和办理相关手续。'),

        m('.hl-text-bold', '病残旅客'),
        m('p.hl-text-sm', '精神或身体的缺陷（或病态）而无自理能力，其行动需他人照料的人，称为病残旅客。这类旅客请联系航空公司确认是否符合承运批准和办理预订购票手续。'),

        m('.hl-text-bold', '老年旅客'),
        m('p.hl-text-sm', '六十周岁以上的老人旅客，身体健康或自认为身体健康，有自理能力，在航空旅途过程中不需要航空公司给予特别照顾，此类旅客可按一般旅客进行运输； 因年龄偏大，在航空旅途过程中需要航空公司提供某种或多种服务的老年人旅客，请联系航空公司购票和办理相关手续。'),

        m('.hl-tips', '* 针对特殊旅客各航空公司规定略有不同，详细规则以承运航空公司为准。')
      ])
    ]);
  }
}, [injectCtrls({ user: services })]);
