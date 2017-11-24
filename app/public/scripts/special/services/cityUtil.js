const localToStandard = {
  SIA: 'XIY',
  BJS: 'BJS_C',
  SHA: 'SHS_C',
  CKG: 'CQS_C'
};

const standardToLocal = {
  XIY: 'SIA',
  BJS_C: 'BJS',
  SHS_C: 'SHA',
  CQS_C: 'CKG'
};

module.exports = {
  toLocalCityCode(cityCode) {
    return localToStandard[cityCode] || cityCode;
  },

  toStandardCityCode(cityCode) {
    return standardToLocal[cityCode] || cityCode;
  }
};
