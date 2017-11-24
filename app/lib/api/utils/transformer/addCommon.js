let defaultParams = () => {
  let params = {
    uid: 10000,
    client: 'web', // 被嵌入客户端，默认为web
    source: 'web', // 流量来源，如wechat，默认为web
    system: 'web',
    systemtime: new Date().getTime(),

    // 以下为不变字段
    uuid: '9fc5325c-2637-4f4a-8839-011da59133ed',
    platform: 'web', // 始终为web
    imei: '860407001910567',
    cver: '6.2',
    dver: '4.3',
    iver: '4.3'
  };

  params.p = [
    params.source,
    params.platform,
    params.client,
    params.cver,
    'nodejs'
  ].join(',');

  return params;
};



module.exports = (override = {}) =>
  params => Object.assign({}, defaultParams(), override, params);
