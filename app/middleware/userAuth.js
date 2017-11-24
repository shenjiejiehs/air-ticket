/**
 * ensure user info existing in session, and userInfo includes these properties:
 * phone: current user's phone number
 * phoneId: current user's phoneid
 * authCode: authentication Code
 * name: user name
 */
var getValByPath = require('../common/l/valByKeypath.js');
module.exports = function (req, res, next){
  if (!req.session) {
    console.log('express-session is required for user_auth middleware');
    res.status(400).json({
      code:'no_session',
      msg:'服务器异常，请稍后重试。'
    });
    return;
  }
  var properties = ['userInfo.phoneId', 'userInfo.authCode'];
  if(!checkAllProperties(properties, req.session)){
    console.log('No user info in session.');
    console.log('Session info: ', req.session.sessionInfo);
    console.log('User info: ', req.session.userInfo);

    res.status(400).json({
      code:'no_session_auth',
      msg: '用户未登录或会话超时，请退出重试。'
    });
    return;
  }
  req.userInfo = req.session.userInfo;
  next();
};

function checkAllProperties(properties, o){
  var i = 0, l = properties.length, result = true;
  for(; i < l; i++){
    if(getValByPath(properties[i], o) == null){
      result = false;
      break;
    }
  }
  return result;
}