const router = require('express').Router();
const hbgjSystem = require('./../../lib/api/hbgjSystem');

const pipeline = require('./utils/pipeline');
const collect = require('./utils/collect');
const addPhoneId = require('./utils/addPhoneId');
const send = require('./utils/send');

router.get(
  '/queryOrder',
  pipeline([
    collect(),
    addPhoneId({ key: 'phoneid' }),
    hbgjSystem.gift.order.query,
    send()
  ])
);

module.exports = router;
