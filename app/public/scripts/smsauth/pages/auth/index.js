const m = require('m-react');
const injectCtrls = require('modules/mixins/injectCtrls');
const Header = require('components/header');
const map = require('utils/map');

const authPage = require('../../substores/authPage');
const controllers = { authPage };

require('./index.css');

const view = {
  title: '验证您的身份',
  selectors: map((_, name) => name)(controllers),
  facets: {},
  render: function(props, { authPage }) {
    const { phone, code, countdown } = authPage;
    return m('.smsauth-auth', [
      m(Header, { title: this.title }),
      m('.hl-box-border-none', { style: { background: 'transparent' } }, [
        countdown
          ? m('.hl-text-sm', '短信验证码已发送，请填写验证码确认您的身份')
          : m('.hl-text-sm', '请输入您的手机号，我们会通过短信向您发送验证码来确认您的身份。'),
        m(
          '.form-field',
          m('input.phone', {
            type: 'tel',
            value: phone,
            placeholder: '您的手机号码',
            oninput: e =>
              this.signal('authPage.update')({ phone: e.target.value })
          })
        ),
        m('.form-field.fx-v-center', [
          m('input.code.fx-1', {
            type: 'number',
            value: code,
            placeholder: '输入验证码',
            oninput: e =>
              this.signal('authPage.update')({ code: e.target.value })
          }),
          countdown
            ? m(
              '.send-code.hl-btn.hl-btn-primary.hl-disabled',
              `${countdown}秒后重试`
            )
            : m(
              '.send-code.hl-btn.hl-btn-primary',
              { onclick: this.signal('authPage.sendCode') },
              '获取验证码'
            )
        ]),
        m(
          '.submit.hl-btn.hl-btn-primary.hl-btn-block' +
            (phone.length && code.length ? '' : '.hl-disabled'),
          {
            onclick: phone.length && code.length &&
              this.signal('authPage.submit')
          },
          '确 定'
        )
      ])
    ]);
  }
};

module.exports = m.createComponent(view, [ injectCtrls(controllers) ]);
