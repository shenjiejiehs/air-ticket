var m = require('m-react');
var cn = require('utils/m/className');
var nativeApi = require('utils/nativeApi');
var Popup = require('components/popup');
var Logger = require('utils/logger');

require('./index.css');

module.exports = m.createComponent({
  defaultProps: {
    name: '',
    phone: '',
    // onInput: () => {},
    // invoke nativeApi to get contact info
    onChooseContact: console.log.bind(console)
  },
  getInitialState() {
    return { isNativeAvail: false };
  },
  componentWillMount() {
    nativeApi
      .isAvail()
      .then(isAvail => this.setState({ isNativeAvail: isAvail }));
  },
  render(props, state) {
    return m(
      '.contact-info',
      m('.hl-list-group.hl-list-group-indent', [
        m('.basic-info.hl-relative', [
          state.isNativeAvail
          ? m('.hl-middle-R.icon-contact', { evClick: this.chooseContact })
          : null,
          m(
            '.hl-list-group-item',
            m('.hl-indent-icon.person-icon'),
            m('.hl-row', [
              m('.hl-col-4', '联系人姓名'),
              m(
                '.hl-col-8',
                m('input.hl-input-nopadding.hl-text-right', {
                  className: cn({ 'input-msg': state.isNativeAvail }),
                  placeholder: '请输入联系人姓名',
                  value: props.name || null,
                  evInput: props.onInput &&
                  (e =>
                    props.onInput({
                      key: 'contact.name',
                      value: e.target.value
                    }))
                })
              )
            ])
          ),
          m(
            '.hl-list-group-item',
            m('.hl-indent-icon.phone-icon'),
            m('.hl-row', [
              m('.hl-col-4.', '联系电话'),
              m(
                '.hl-col-8',
                m('input.hl-input-nopadding.hl-text-right', {
                  className: cn({ 'input-msg': state.isNativeAvail }),
                  placeholder: '请输入联系电话',
                  type: 'tel',
                  value: props.phone || null,
                  evInput: props.onInput &&
                  (e =>
                    props.onInput({
                      key: 'contact.phone',
                      value: e.target.value
                    }))
                })
              )
            ])
          )
        ])
      ])
    );
  },
  chooseContact() {
    let thisComponent = this;

    nativeApi
      .invoke('selectContact', { maxNum: '1' })
      .then((data = {}) => {
        // keep silent when api succeed but no contact was choosed
        if (!data.contacts || !data.contacts.length) {
          Logger.info(data, 'chooseContact#noContactChoosed');
          return;
        }

        data.contacts.forEach(contact => {
          if (!contact.name && !contact.phone) {
            throw {msg: '获取联系人姓名和电话失败'};
          }

          thisComponent.props.onChooseContact({
            name: contact.name || '',
            phone: contact.phone || ''
          });
        });
      })
      .catch(err => {
        // android accidently throws error when no contacts choosed
        if(err.code && err.code == -1003) {
          return;
        }

        Logger.error(err, 'chooseContact#failed');
        Popup.alert(err && err.msg ? err.msg : '选择联系人暂不可用');
      });
  }
});
