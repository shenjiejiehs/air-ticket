var merge = require('merge');
var moment = require('moment');

var express = require('express');
var router = express.Router();

var DEFAULT_EXPIRE = 10 * 60 * 1000;
var TIME_FORMAT = 'YYYY-MM-DD h:mm:ss';

var options = {
  name: null,
  session: null,
  expire: DEFAULT_EXPIRE
};

function sessionKeeper(req, res, next) {
  var session = req.session;

  if (!session) {
    console.log('express-session is required for session_keeper middleware');
    return next();
  }

  var sessionInfo = session.sessionInfo;

  var referer = cleanReferer(req.get('referer'));

  if (!sessionInfo) {
    session.sessionInfo = sessionInfo = getNewSessionInfo(session.id, req.originalUrl);
  }

  if (!sessionInfo.referer || typeof sessionInfo.referer != 'object') {
    sessionInfo.referer = {};
  }

  if (!sessionInfo.expire || sessionInfo.expire >= Date.now() || referer in sessionInfo.referer) {

    refreshSessionInfo(sessionInfo, referer);
    next();

  } else {
    // convert dict to array
    if (sessionInfo.referer) {
      sessionInfo.referer = Object.keys(sessionInfo.referer);
    }
    console.log("Session expired, ", sessionInfo);

    session.regenerate(function(err) {
      if (err) {
        console.log('Regenerate session failed: ', err);
      }

      session = req.session;
      session.sessionInfo = sessionInfo = getNewSessionInfo(session.id, req.originalUrl);

      refreshSessionInfo(sessionInfo, referer);
      next();
    });
  }
}

function cleanReferer(referer) {
  if (referer) {
    // drop the querystring, which would change during pushState
    var idx = referer.indexOf('?');
    if (idx !== -1) {
      referer = referer.substr(0, idx);
    }

    // Mongo does not support dotted field
    referer = referer.replace(/\./g, '-');
  }

  return referer;
}

function getNewSessionInfo(id, entry) {
  return {
    sessionId: id,
    entry: entry,
    referer: {},
    entryTime: moment(Date.now()).format(TIME_FORMAT)
  };
}

function refreshSessionInfo(sessionInfo, referer) {
  sessionInfo.expire = (Date.now() + options.expire);

  if (referer) {
    sessionInfo.referer[referer] = 1;
  }
}

function clearInvalidCookie(req) {
  var re = new RegExp(options.name + '[^;]*;');
  var cookie = req.headers.cookie;
  req.headers.cookie = cookie.replace(re, '');

  delete req.cookies[options.name];
  delete req.signedCookies[options.name];
}


function sessionCheck(req, res, next) {
  var session = req.session;
  if (!session) {
    console.log('express-session is required for session_keeper middleware');
    return next();
  }

  var sessionInfo = session.sessionInfo;
  if (!sessionInfo && options.name in req.cookies) {
    console.log('Invalid session detected, clear for reentry');
    console.log('Cookies: ', req.headers.cookie);

    clearInvalidCookie(req);
    delete req.session;
  }

  next();
}


function reentryCheck(middleware) {
  return function(req, res, next) {
    if (!req.session) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
}


module.exports = function(opts) {
  merge(options, opts);

  if (options.name && options.session) {
    router.use(sessionCheck);
    router.use(reentryCheck(options.session));
  }

  router.use(sessionKeeper);

  return router;
};
