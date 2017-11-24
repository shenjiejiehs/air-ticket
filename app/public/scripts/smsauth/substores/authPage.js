const createSubstore = require('modules/createSubstore');
const { log, fake, loading, catchError } = require('utils/decorators');
const Promise = require('utils/promise');
const request = require('utils/request');
const compose = require('utils/compose');
const user = require('utils/user');
const url = url => (window.url_base || '') + url;
const validator = require('utils/validator');
const Toast = require('components/toast');
const map = require('utils/map');

const api = {
  sendCode: compose(loading(), log('sendCode'))(
    ({ phone }) =>
    request({
      url: url('api/user/auth/sendCode'),
      method: 'GET',
      data: { phone }
    })
  ),
  verifyLoginCode: compose(loading(), log('verifyLoginCode'))(
    ({ phone, code }) =>
    request({
      url: url('api/user/auth/verifyLoginCode'),
      method: 'GET',
      data: { phone, code }
    })
  )
};

const initState = {
  //  DEBUG
  phone: '',
  code: '',
  timer: null,
  countdown: 0,
  $defer: null
};

const service = createSubstore({
  name: 'authPage',
  state: initState,
  facets: {},
  service: ctrl => map(catchError)({
    /**
     * 加载身份验证页面
     * 当用户成功验证身份，获得phoneId时resolve: user
     * 其他情况（用户回退等）不resolve
     */
    load(payload, { isReplace } = {}) {
      ctrl.set(initState);
      ctrl.signal('::route')({ route: 'smsauth/pages/auth', isReplace });
      return new Promise((resolve, reject) => {
        ctrl.set('$defer', { resolve, reject });
      });
    },
    update(keyValue) {
      ctrl.set(keyValue);
    },
    sendCode() {
      if (!validator.isPhone(ctrl.get('phone'))) {
        return Toast.show('请输入正确的手机号码');
      }
      service.startCountdown();
      return api.sendCode({ phone: ctrl.get('phone') }).catch(e => {
        service.forceEndCountdown();
        throw e;
      });
    },
    startCountdown() {
      function count() {
        const countdown = ctrl.get('countdown') - 1;
        ctrl.set({ countdown });
        if (countdown > 0) {
          ctrl.set('timer', setTimeout(count, 1000));
        }
      }
      ctrl.set('countdown', 60);
      ctrl.set('timer', setTimeout(count, 1000));
    },
    forceEndCountdown() {
      clearTimeout(ctrl.get('timer'));
      ctrl.set({ timer: null, countdown: 0 });
    },
    submit() {
      const { phone, code } = ctrl.get('');
      if (!validator.isPhone(phone)) {
        return Toast.show('请输入正确的手机号码');
      }
      return api.verifyLoginCode({ phone, code }).then(result => {
        service.forceEndCountdown();
        history.back();
        ctrl.get('$defer').resolve(user.getUserInfo());
        // TODO: how to reject on user navigating back?
      });
    }
  })
});

module.exports = service;
