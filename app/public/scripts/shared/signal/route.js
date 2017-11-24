var router = require('utils/router');
module.exports = function(signal){
  signal.on('route', onRoute)
    .on('route.sessionStart', onSessionStart)
    .on('route.sessionEnd', onSessionEnd)
    .on('route.back', onHistoryBack)
    .on('route.stopBack', onStopHistoryBack)
    .on('route.resumeBack', onResumeHistoryBack);
};

function onRoute(payload){
  var state = payload.state,
    routerHandler = payload.route,
    isReplace = payload.isReplace,
    ctxHandler = payload.contextHandler;  

  if(typeof route === 'function'){
    return routerHandler(router);
  }

  var ctx = router[isReplace ? 'replace': 'show'](routerHandler, state);
  if(typeof ctxHandler === 'function'){
    return ctxHandler(ctx);
  }
}

function onSessionStart(sname){
  router.startSession(sname);
}

function onSessionEnd(sname){
  router.endSession(sname);
}

function onHistoryBack(delay){
  setTimeout(function(){
    history.back();
  }, delay || 10);
}

function onStopHistoryBack(){
  router.stopBack();
}

function onResumeHistoryBack(){
  router.resumeBack();
}
