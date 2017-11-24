const request = require('../utils/request');
const pipe = require('../utils/pipe');

const addCommon = require('../utils/transformer/addCommon');
const addParam = require('../utils/transformer/addParam');
const toRequestOption = require('../utils/transformer/toRequestOption');
const timeout = require('./../utils/decorator/timeout');

// const typings = require('./typings');

const env = process.env.ENV || 'dev';

const hosts = {
  special: {
    prod: 'http://search.hbgj.huoli.local:80/cf',
    test: 'http://47.93.50.96:9090/cf',
    dev: 'http://47.93.50.96:9090/cf'
  }[env]
};

module.exports = {
  // 查询首页
  queryHome: pipe([
    addCommon(),
    addParam({
      st: 0
    }),
    toRequestOption({
      url: `${hosts.special}`,
      method: 'GET',
      gzip: true
    }),
    timeout()(request),
    pickResult
  ]),

  // 查询列表页
  queryList: pipe([
    addCommon(),
    addParam({
      st: 1
    }),
    toRequestOption({
      url: `${hosts.special}`,
      method: 'GET',
      gzip: true
    }),
    timeout()(request),
    pickResult
  ]),

  // 查询详情页
  queryDetail: pipe([
    addCommon(),
    addParam({
      st: 2
    }),
    toRequestOption({
      url: `${hosts.special}`,
      method: 'GET',
      gzip: true
    }),
    timeout()(request),
    pickResult
  ]),

  // 查询更多消息
  queryMoreMessage: pipe([
    addCommon(),
    addParam({
      st: 4
    }),
    toRequestOption({
      url: `${hosts.special}`,
      method: 'GET',
      gzip: true
    }),
    timeout()(request),
    pickResult
  ]),

  // 查询消息详情
  queryMessageDetail: pipe([
    addCommon(),
    addParam({
      st: 5
    }),
    toRequestOption({
      url: `${hosts.special}`,
      method: 'GET',
      gzip: true
    }),
    timeout()(request),
    pickResult
  ]),

  // 查询城市白名单
  queryCityWhiteList: pipe([
    addCommon(),
    addParam({
      st: 6
    }),
    toRequestOption({
      url: `${hosts.special}`,
      method: 'GET',
      gzip: true
    }),
    timeout()(request),
    pickResult
  ]),

  // 查询城市模糊词
  queryCityFuzzy: pipe([
    addCommon(),
    addParam({
      st: 7
    }),
    toRequestOption({
      url: `${hosts.special}`,
      method: 'GET',
      gzip: true
    }),
    timeout()(request),
    pickResult
  ]),

  // 猜你喜欢
  queryRecommend: pipe([
    addCommon(),
    addParam({
      st: 9,
      ps: 200
    }),
    toRequestOption({
      url: `${hosts.special}`,
      method: 'GET',
      gzip: true
    }),
    timeout()(request),
    pickResult
  ])
};

function pickResult(result) {
  const data = result.data;

  if (Number(data.status) == 0) {
    return result;
  }

  result.msg = result.errors;
  result.error = data;
  result.statusCode = Number(result.status) > 300 ? result.status : 400;
  throw result;
}
