var parser = require('xml2js').Parser({ explicitArray: false });

var parse = data => new Promise((resolve, reject) => {
  parser.parseString(data, (err, result) => {
    if (err) {
      return reject(err)
    }
    resolve(result)
  })
})


module.exports = () => result =>
  parse(result.data).then(
    data => {
      result.data = data
      return result
    },
    error => {
      result.error = error
      result.message = 'Failed to parse xml: ' + error.message || ''
      throw result
    }
  )
