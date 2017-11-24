/**
 * 生成供request (2.53)使用的Options
 *
 * https://github.com/request/request/tree/ecadac826fb7ff525b2a02927d1f686e131413a7
 */
module.exports = config => param => Object.assign({},
  config.method === 'POST' ? {
    form: param,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  } : { qs: param },
  config
)
