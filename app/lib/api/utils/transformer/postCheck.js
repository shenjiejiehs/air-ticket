module.exports = schema => result => {
  const error = schema(result.data);
  if (error) {
    result.error = error
    result.message = 'Post-check failed: ' + error.message
    result.statusCode = 500
    throw result
  } else {
    return result
  }
}
