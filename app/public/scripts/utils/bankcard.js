module.exports = {
  // 根据身份证获取日期
  getDateByIdCard: function(idCard) {
    var birthday = '';
    if (idCard) {
      if (idCard.length === 15) {
        birthday = '19' + idCard.substr(6, 6);
      } else if (idCard.length === 18) {
        birthday = idCard.substr(6, 8);
      }

      birthday = birthday.replace(/(.{4})(.{2})/, '$1-$2-');
    }

    return birthday;
  },

  // 根据身份证获取性别
  getGenderByIdCard: function(idCard) {
    if (idCard.length !== 15 && idCard.length !== 18) {
      return '';
    }

    let genderId = idCard.length === 15 ? idCard.substr(-1) : idCard.substr(-2);
    if (Number(genderId) % 2 === 0) {
      return '女';
    }
    return '男';
  }
};
