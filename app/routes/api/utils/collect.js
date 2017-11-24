/**
 * 将req.query, req.body合并为payload
 */
const isDev = /(test|dev)/.test(process.env.NODE_ENV || 'dev');
const collect = () =>
  (_, req, res) => {
    const logger = req.log || console;
    const params = Object.assign({}, req.query, req.body);
    if (isDev) {
      logger.info('[api] params', params);
    }
    return params;
  };

module.exports = collect;
