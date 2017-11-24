const isDev = (process.env.NODE_ENV || 'dev') === 'dev';

module.exports = (name = 'api') => service => param => {
  if (isDev) { console.info(`[${name}] param:`, param); }
  return service(param)
    .then(
      result => {
        if (isDev) { console.info(`[${name}] success:`, result); }
        return result;
      },
      error => {
        console.error(`[${name}] error:`, {
          param,
          body: error && error.response && error.response.body,
          message: error && (error.message || error.msg || '')
        });
        throw error;
      }
    );
}
