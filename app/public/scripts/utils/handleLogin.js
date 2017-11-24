module.exports = function login(ctrl, needReplaySignal){
  return requireAsync('user').then(function(user){
    return user.startProcess({
      page: 'user/pages/smsAuth',
      session: 'login'
    });
  }).then(function(){
    if(needReplaySignal){
      ctrl.replaySignal();
    }
    ctrl.signal('::route.back')();
  })['catch'](function (){
    ctrl.signal('::route.back')();
  });
};
