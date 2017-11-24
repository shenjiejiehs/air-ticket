var m = require('m-react');
var Header = require('components/header');
var PassengerInfo = require('./index');
const router = require('utils/router');
const initRoute = require('modules/initRoute');

module.exports = m.createComponent({
  title: '组件测试：选择乘机人',

  getInitialState() {
    return {
      passengers: [{
        name: '徐洋',
        itn: '身份证',
        idcard: '123',
        type: 'ADT' // 'ADT'成人 'CHD':儿童
      }, {
        name: '徐小洋',
        itn: '身份证',
        idcard: '234',
        type: 'CHD' // 'ADT'成人 'CHD':儿童
      }, {
        name: 'XU YANG',
        itn: '护照',
        idcard: '546',
        type: 'CHD'
      }]
    };
  },

  onAddPassenger() {
    requireAsync('user/services').then(user => {
      user.signal('passenger.start')({
        type: 'domestic',
        passengers: this.state.passengers,
        onComplete: result => {
          console.log(result);
        }
      });
    });
  },

  onDeletePassenger(passengers) {
    this.setState({
      passengers: passengers
    });
  },

  render(props, state) {
    return m('.test-page', [
      m(Header, { title: this.title }),
      m('.hl-separator'),
      m(PassengerInfo, {
        passengers: state.passengers,
        onDelete: this.onDeletePassenger,
        onAdd: this.onAddPassenger
      })
    ]);
  }
});
