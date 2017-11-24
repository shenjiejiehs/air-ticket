var EMAIL_PATTERN = /^\s*\w+(?:\.{0,1}[\w-]+)*@[a-zA-Z0-9]+(?:[-.][a-zA-Z0-9]+)*\.[a-zA-Z]+\s*$/;
var PHONE_PATTERN = /^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/;
var IDENDITY_PATTERN = /^((\d{15})|(\d{18})|(\d{17}[\d|X|x]))$/;
var PASSPORT_PATTERN = /^[a-zA-Z0-9]{5,17}$/;
var GA_PASSPORT_PATTERN = /^([HMhm]{1}([0-9]{10}|[0-9]{8}))$/;
var TW_PASSPORT_PATTERN = /^[0-9]{8}$|^[0-9]{10}$/;
var DIGIT_PATTERN = /^\d+(\.\d+)?$/;


var extend = require('common/extend');
var datetime = require('./datetime');
var type = require('common/type');

function validator(pred, errMsg){
  return function _validator(val){
    return {
      isValid: !!pred(val),
      errMsg: errMsg
    };
  }
}

extend(validator, {
  isPhone: function(phone) {
    phone = String(phone).replace('+86', '')
                 .replace('-', '')
                 .replace(' ', '')
                 .trim();
    return PHONE_PATTERN.test(phone);
  },

  isEmail: function(email) {
    email = String(email).trim();
    return EMAIL_PATTERN.test(email);
  },

  isIdendity: function(id){
    id = String(id).trim();
    return IDENDITY_PATTERN.test(id);
  },

  isPassport: function(p){
    p = String(p).trim();
    return PASSPORT_PATTERN.test(p);
  },

  isGaPassport: function(gap){
    gap = String(gap).trim();
    return GA_PASSPORT_PATTERN.test(gap);
  },

  isTwPassport: function(twp){
    twp = String(twp).trim();
    return TW_PASSPORT_PATTERN.test(twp);
  },

  isNotEmpty: function(str){
    return typeof str === 'string' && str.trim().length > 0;
  },

  isArrayNotEmpty: function(arr) {
    return type(arr) === 'array' && arr.length > 0;
  },

  isNumber: function (val){
    return !isNaN(parseFloat(val)) && isFinite(val);
  },

  isDigit: function (val){
    return DIGIT_PATTERN.test(val);
  },

  isValidDate: function (val){
    var date = datetime.parse(val);
    return date instanceof Date;
  }
});

module.exports = validator;
