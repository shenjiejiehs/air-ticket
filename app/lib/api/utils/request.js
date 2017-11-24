const request = require('request');

/**
 * 将request封装为Promise形式
 * 注意：对result/error的后续处理务必保留已有的字段
 *
 *
 * @param any options
 * @returns Promise result
 *   resolve with: Object {
 *      data,  // parse后的body
 *      options,  // 调用使用的options
 *      response,
 *      statusCode
 *   }
 *   reject with: Error {
 *      error,  // 描述错误信息的对象
 *      message, // 用于内部日志的错误信息
 *      msg,   // 用于提示给用户的错误信息
 *      options,  // 请求服务端的参数
 *      response,  // 服务端响应
 *      statusCode  // 准备用于返回前端的状态码，20X为请求成功(获得/修改了所需资源)，40X为客户端错误（请求参数不当/条件不满足等），50X为服务器错误
 *   }
 */
module.exports = options => new Promise(function(resolve, reject) {
  request(options, (error, response, body) => {
    // 网络错误
    if (error) {
      return reject({
        error,
        options,
        response,
        statusCode: 500,
        message: error.message || ''
      });
    }

    let parsed = body;
    if (typeof body === 'string') {
      try {
        parsed = JSON.parse(body);
      } catch (e) {
        null;
      }
    }

    // 后端服务器未返回成功HTTP状态码
    if (!(response.statusCode >= 200 && response.statusCode < 400)) {
      return reject({
        error: parsed,
        message: parsed.message,
        options,
        response,
        statusCode: response.statusCode
      });
    }

    resolve({ data: parsed, options, response, statusCode: 200 });
  });
});
