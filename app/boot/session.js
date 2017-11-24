var session = require('express-session');
var mongoDBStore = require('./mongoStore');

module.exports = function session$(app, params) {
  var store = null;

  var maxAge = parseInt(getMaxAge(app), 10) || 7200;

  var sessionOptions = {
    name: params.sidName || 'appSid',
    secret: params.secret || 'XdKBdSSkS0',
    resave: true,
    saveUninitialized: false
  };

  if (process.env.NODE_ENV === 'production') {
    sessionOptions.cookie = {
      secret: true,
      maxAge: maxAge
    };

    sessionOptions.rolling = true;
  }

  // console.log('session params: %j', params);
  if (useMongo(app, params)) {
    console.log('connecting mongo database...');
    console.log('mongoUri: ', getMongoUri(app, 'web-session'));
    store = mongoDBStore.get(
      {
        url: getMongoUri(app, 'web-session'),
        collection: params.mongodbCollection,
        ttl: maxAge
      },
      session
    );
    sessionOptions.store = store;
  }

  // initialize session
  if (params.enabled !== false) {
    app.use(session(sessionOptions));
  }
};

function getMongoUri(app, dbName) {
  var env = app.get('appConfig').env;
  var hosts = (env.MONGO_DB_HOST || 'localhost').split(',');
  var username = env.MONGO_DB_USERNAME;
  var passwd = env.MONGO_DB_PASSWD;
  var replicaSet = env.MONGO_DB_REPLICASET;

  var userPhrase = username
    ? encodeURIComponent(username) + ':' + encodeURIComponent(passwd) + '@'
    : '';
  var replicaSetStr = replicaSet ? '?replicaSet=' + replicaSet : '';

  return [
    'mongodb://',
    userPhrase,
    hosts.join(','),
    '/',
    dbName,
    replicaSetStr
  ].join('');
}

function getMaxAge(app) {
  var env = app.get('appConfig').env;
  //default 10 minutes;
  return env.SESSION_MAX_AGE || 10 * 60 * 1000;
}

function useMongo(app, params) {
  var env = app.get('appConfig').env;
  return (
    (!env || env.MONGO_ENABLED !== false) &&
    params.cluster &&
    params.enabled !== false &&
    params.mongodbCollection
  );
}
