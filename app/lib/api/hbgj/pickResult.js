const CODE_MSG = {
  1: 'success',
  0: 'fail',
  '-401': 'relogin',
  '-999': 'invalid sid',
  '-500': 'invalid common params',
  '-501': 'invalid param',
  '-600': 'nonexist api'
}


module.exports = ({ successCode = 1 } = {}) => result => {
  let data = result.data
  if (!(data.res && data.res.hd)) {
    result.message = 'Invalid data structure: `data.res.hd` must exist'
    result.error = data
    throw result
  }

  if (data.res.hd.code == successCode) {
    result.data = data.res.bd
    return result
  } else {
    result.message = data.res.hd.desc || CODE_MSG[data.res.hd.code] || ''
    result.msg = data.res.hd.desc || ''
    result.error = data.res.hd
    throw result
  }
}
