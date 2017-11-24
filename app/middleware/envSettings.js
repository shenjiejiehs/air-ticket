/**
 * 提供‘dev’标记，可以用于模板渲染
 */

module.exports = function(req, res, next) {
  res.locals.env = process.env.NODE_ENV || 'dev';

  if (!process.env.NODE_ENV) {
    res.locals.dev = true;
  }

  if (!/prod/i.test(process.env.NODE_ENV)) {
    res.locals.debug_console = true;
  }
  next();
};
