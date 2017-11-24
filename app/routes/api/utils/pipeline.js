const isDev = /(test|dev)/.test(process.env.NODE_ENV || 'dev');

/**
 * 将转换器队列转换为middleware中间件
 *
 * @param transformers Array<Transformer>
 *  Transformer:   (payload, req, res) => payload
 *  Transformer:   (payload, req, res) => Promise<payload>
 */

const pipeline = transformers =>
  (req, res, next) =>
    transformers
      .reduce(
        (prev, cur) => prev.then(payload => cur(payload, req, res)),
        Promise.resolve(null)
      )
      .catch((e = {}) => {
        const msg = e.msg || '服务器通信失败，请稍后重试';
        const log = req.log || console;
        const statusCode = Number(e.statusCode) > 300 ? e.statusCode : 500;
        console.error(e);
        log.error('[api] error', JSON.stringify(e, ' ', 2));
        res.status(statusCode).json(isDev ? e : { msg });
      });

module.exports = pipeline;
