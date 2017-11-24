const initService = require('modules/initService');
const Popup = require('components/popup');
const Toast = require('components/toast');
const api = require('./api');
const logger = require('utils/logger');
const router = require('utils/router');
const Promise = require('utils/promise');
const { getDateByIdCard, getGenderByIdCard } = require('utils/bankcard');

const service = initService({
  namespace: 'user',
  data: {
    passenger: {
      type: 'domestic', // 'domestic':国内, 'international':国际
      enableSelect: true, // 是否允许选择
      multiSelect: true, // 多选
      selectedList: [], // 外部选中的乘机人
      // 乘机人列表
      list: [],
      // 编辑／添加的乘机人
      edit: {
        type: 'domestic', // 'domestic':国内, 'international':国际
        action: 'add', // add: 添加, edit: 编辑, delete: 删除成功
        // 选择项目
        formOptions: {
          idtype: [],
          passtype: [],
          gender: [{ name: '男', value: '男' }, { name: '女', value: '女' }]
        },
        info: {}
      },
      // 拼音姓名编辑
      pinyinEdit: { pinyin: [], chinesepinyin: [] }
    }
  },
  facets: {
    selectedList: [
      'passenger.list',
      list => {
        return []
          .concat(list)
          .filter(item => {
            return item.selected;
          })
          .map(item => {
            delete item.selected;
            return item;
          });
      }
    ]
  },
  action: ctrl => ctrl.signal('passenger.start', (ctrl, next, input = {}) => {
    // 数组初始化
    ctrl.set({
      'passenger.type': input.type || 'domestic', // 'domestic':国内, 'international':国际
      'passenger.enableSelect': input.enableSelect === false ? false : true, // 是否允许选择
      'passenger.multiSelect': input.multiSelect === false ? false : true, // 多选
      'passenger.selectedList': input.passengers ? input.passengers : [],
      'passenger.list': []
    });

    // 完成后的回掉
    if (input.onComplete) {
      ctrl.$done = input.onComplete;
    }

    ctrl.signal('::route')({ route: 'user/pages/passenger/list' });
  }).signal('passenger.list.load', (ctrl, next, input) => {
    api.passenger.load({ type: ctrl.get('passenger.type') }).then(result => {
      let selectedList = ctrl.get('passenger.selectedList');
      let orginList = ctrl.get('passenger.list');

      let dst = [].concat(result).map(item => {
        selectedList.forEach(x => {
          if (x.psid && x.psid === item.psid) {
            item.selected = true;
          }
        });

        // 跟新list数据时，保存原来的选择状态
        orginList.forEach(y => {
          if (y.psid === item.psid) {
            item.selected = y.selected;
          }
        });

        return item;
      });

      ctrl.set('passenger.list', dst);
    }).catch(onFail);
  }).signal('passenger.list.select', (ctrl, next, input) => {
    let { passenger, idx } = input;
    let list = ctrl.get('passenger.list');
    passenger.selected = !passenger.selected;
    list.splice(idx, 1, passenger);
    ctrl.set('passenger.list', list);
  }).signal('passenger.list.submit', (ctrl, next, input) => {
    // to do 把值传给掉用的组件或页面
    let passengers = ctrl.facet('selectedList');

    // 很ugly的实现
    ctrl.$done({ passengers: passengers });
    router.back();
  }).signal('passenger.edit.load', (ctrl, next, input) => {
    Promise
      .resolve(input)
      .then(result => {
        ctrl.set({
          'passenger.edit.type': result.type,
          'passenger.edit.action': result.action,
          'passenger.edit.info': result.info
        });

        let { name, chinesepinyin, idtype, idcard, birthday, gender } = result.info;
        // chinesepinyin 特殊处理
        // 当存在name但是没有chinesepinyin时，初始化chinesepinyin
        const regularExp = /^[\u4e00-\u9fa5]+$/;
        if (name && regularExp.test(name) && (!chinesepinyin || chinesepinyin && chinesepinyin.length === 0)) {
          api.pinyin(name).then(result => {
            const pinyinArr = [].concat(result.pinyin).filter(Boolean);
            chinesepinyin = pinyinArr.map(item => {
              return {
                name: item.name,
                value: item.value.split(',')[0]
              };
            });
            ctrl.set('passenger.edit.info.chinesepinyin', chinesepinyin);
          });
        }

        // birthday 和 gender 特殊处理
        // 身份证号已知，去补充生日和性别
        if (idtype == '0' && idcard) {
          if (!birthday) {
            birthday = getDateByIdCard(idcard);
            ctrl.set('passenger.edit.info.birthday', birthday);
          }
          if (!gender) {
            gender = getGenderByIdCard(idcard);
            ctrl.set('passenger.edit.info.gender', gender);
          }
        }
        return;
      })
      .then(() => {
        // load form options
        const formOptions = ctrl.get('passenger.edit.formOptions');
        if (formOptions.idtype.length && formOptions.passtype.length) {
          return formOptions;
        } else {
          return api.baseData.load();
        }
      })
      .then(data => {
        // set form options
        ctrl.set({
          'passenger.edit.formOptions.idtype': data.idtype,
          'passenger.edit.formOptions.passtype': data.passtype
        });
        // route
        ctrl.signal('::route')({ route: 'user/pages/passenger/edit' });
      })
      .catch(onFail);
  }).signal('passenger.edit.submit', (ctrl, next, input) => {
    const action = input.action;
    const passenger = input.passenger;

    if (action == 'add') {
      api.passenger.add(passenger).then(() => {
        Toast.show('添加成功');
        router.back();
      }).catch(onFail);
    } else if (action === 'edit') {
      api.passenger.modify(passenger).then(() => {
        Toast.show('修改成功');
        router.back();
      }).catch(onFail);
    } else if (action === 'delete') {
      Popup.confirm('确认要删除吗?').then(confirm => {
        if (confirm) {
          api.passenger.delete(passenger).then(() => {
            Toast.show('删除成功');
            router.back();
          }).catch(onFail);
        }
      });
    }
  }).signal('passenger.edit.input', (ctrl, next, input) => {
    ctrl.set('passenger.edit.info.' + input.key, input.value);
  }).signal('passenger.pinyinEdit.load', (ctrl, next, input) => {
    api.pinyin(input.chinesename).then(result => {
      ctrl.set({
        'passenger.pinyinEdit.pinyin': result.pinyin,
        'passenger.pinyinEdit.chinesename': input.chinesename,
        'passenger.pinyinEdit.chinesepinyin': input.chinesepinyin
      });
      ctrl.startProcess({
        signal: '::route',
        data: {
          route: 'user/pages/passenger/pinyinEdit'
        }
      }).done(
        // onDone
        result => {
          ctrl.set('passenger.edit.info.chinesepinyin', result);
          router.back();
        },
        // onCancel
        () => {

        }
      );
      //ctrl.signal('::route')({ route: 'user/pages/passenger/pinyinEdit' });
    }).catch(onFail);
  }).signal('passenger.pinyinEdit.input', (ctrl, next, input) => {
    let chinesepinyin = ctrl.get('passenger.pinyinEdit.chinesepinyin');

    chinesepinyin.splice(input.index, 1, {
      name: input.name,
      value: input.value
    });
    ctrl.set('passenger.pinyinEdit.chinesepinyin', chinesepinyin);
  }).signal('passenger.pinyinEdit.submit', (ctrl, next, input) => {
    // ctrl.set('passenger.pinyinEdit.chinesepinyin', input.chinesepinyin);
    // ctrl.set('passenger.edit.info.chinesepinyin', input.chinesepinyin);
    // router.back();
    ctrl.endProcess('::route', input.chinesepinyin);
  }).signal('passenger.remind.load', (ctrl, next, input) => {
    ctrl.signal('::route')({ route: 'user/pages/passenger/remind' });
  }).signal('passenger.nameGuide.load', (ctrl, next, input) => {
    ctrl.signal('::route')({ route: 'user/pages/passenger/nameGuide' });
  })
});

module.exports = service;

// helper
function onFail(err = {}) {
  logger.error(err, '#user');

  let errMsg = typeof err == 'string' ?
    err :
    err.error && err.error.msg || err.msg;
  return Popup.alert(errMsg || '与服务器通信失败，请稍后重试...');
}
