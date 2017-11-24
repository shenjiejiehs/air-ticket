/**
 * 将处理结果发送给前端
 */

const isDev = /(test|dev)/.test(process.env.NODE_ENV || 'dev');

const send = () => (payload, req, res) => {
  const logger = req.log || console;
  const { data, error, msg, statusCode } = payload || {};
  //debug
  if (payload && payload.options) {
    logger.info('[api] options', JSON.stringify(payload.options, ' ', 2));
  }
  return res.status(200).json(data || payload);
};

module.exports = send;
