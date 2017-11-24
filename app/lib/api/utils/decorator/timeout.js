const delay = timeInMs => new Promise(resolve => setTimeout(resolve, timeInMs));

module.exports = (time = 10000) => service => options => {
  return Promise.race([
      service(options),
      delay(time).then(() => {
        throw {
          code: 'request_timeout',
          message: `request timeout, exceed: ${time} ms`
        };
      })
    ])
    .catch(error => {
      if (error && error.code === 'request_timeout') {
        error.options = options;
      }
      throw error;
    });
};
