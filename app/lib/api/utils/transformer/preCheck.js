module.exports = schema => param => {
  const error = schema(param);
  if (error) {
    const result = {
      error,
      message: 'Pre-check failed: ' + error.message,
      options: param,
      statusCode: 400
    }
    throw result
  } else {
    return param
  }
}
