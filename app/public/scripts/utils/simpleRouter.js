const qs = require('./queryString');
const { load, save } = require('./persist').sessionStorage;
const popup = require('../components/popup/index');
const logger = require('./logger');

const basePath = getBasePath();

const router = Router();

module.exports = router;
module.exports.resolve = toUrl;

//--------- Router ------------

function Router() {
  let stack = (load('simplerouter_stack') || []) // history stack
    .map(({ path, query }) => ({ path, query })); // purge extra properties for handlers to re-initialize

  let index = load('simplerouter_index') || 0; // index of current page in stack

  let routeMap = []; // registered routes and their handlers
  let ctx = {}; // global context when routing

  log('[init]', { stack, index });

  const tasks = {
    beforeEnter: [matchRoutes('beforeEnter')], // function[] | {matcher:function,task:function}[]
    afterEnter: [matchRoutes('afterEnter')],
    beforeLeave: [matchRoutes('beforeLeave')],
    afterLeave: [matchRoutes('afterLeave')]
  };

  window.addEventListener('popstate', e => {
    log('pop');
    if (e && typeof e.state === 'number') {
      log('e.state ', e.state);
      const prev = stack[index];
      const next = stack[e.state];

      return Promise.resolve()
        .then(() =>
          runTask(filterTask(prev, [logBefore, ...tasks.beforeLeave]), {
            route: prev,
            event: e,
            passive: true,
            ctx
          })
        )
        .then(() =>
          runTask(
            filterTask(next, [
              pop,
              persist,
              ...tasks.beforeEnter,
              ...tasks.afterEnter,
              logAfter
            ]),
            {
              route: next,
              event: e,
              passive: true,
              ctx
            }
          )
        )
        .then(() =>
          runTask(filterTask(prev, [...tasks.afterLeave]), {
            route: prev,
            event: e,
            passive: true,
            ctx
          })
        )
        .catch(e => {
          logger.errer(e, '[router] error on popstate');
          location.reload(); // something is wrong, but history is now incorrect and unfixable
        });
    } else {
      location.reload();
    }
  });

  return {
    /**
     * load a new page, and pushstate it
     */
    push(path, query = {}) {
      log('push ', path);
      if (path == null) {
        path = getCurrentPath();
        query = Object.assign(
          {},
          stack[index] && stack[index].query,
          qs.parse(location.search)
        );
      }
      const prev = stack[index];
      const next = { path, query };

      return Promise.resolve()
        .then(() =>
          runTask(filterTask(prev, [logBefore, ...tasks.beforeLeave]), {
            route: prev,
            ctx
          })
        )
        .then(() =>
          runTask(
            filterTask(next, [
              ...tasks.beforeEnter,
              push,
              persist,
              ...tasks.afterEnter,
              logAfter
            ]),
            {
              route: next,
              ctx
            }
          )
        )
        .then(() =>
          runTask(filterTask(prev, [...tasks.afterLeave]), {
            route: prev,
            ctx
          })
        )
        .catch(e => {
          console.error(e);
          logger.error(e, '[router] error on push');
          logger.error({ path, query });
          popup.alert(e && e.msg ? e.msg : '与服务器通信失败，请稍后重试');
        });
    },

    /**
     * load a new page, and replacestate it
     */
    replace(path, query = {}) {
      log('replace ', path);
      if (path == null) {
        path = getCurrentPath();
        query = Object.assign(
          {},
          stack[index] && stack[index].query,
          qs.parse(location.search)
        );
      }
      const prev = stack[index];
      const next = { path, query };

      return Promise.resolve()
        .then(() =>
          runTask(filterTask(prev, [logBefore, ...tasks.beforeLeave]), {
            route: prev,
            ctx
          })
        )
        .then(() =>
          runTask(
            filterTask(next, [
              ...tasks.beforeEnter,
              replace,
              persist,
              ...tasks.afterEnter,
              logAfter
            ]),
            {
              route: next,
              ctx
            }
          )
        )
        .then(() =>
          runTask(filterTask(prev, [...tasks.afterLeave]), {
            route: prev,
            ctx
          })
        )
        .catch(e => {
          console.error(e);
          logger.error(e, '[router] error on replace');
          logger.error({ path, query });
          popup.alert(e && e.msg ? e.msg : '与服务器通信失败，请稍后重试');
        });
    },

    updateQuery(query = {}) {
      const route = stack[index];
      if (route) {
        route.query = query;
        history.replaceState(index, route.title, toUrl(null, query));
        persist();
      }
    },

    back() {
      history.back();
    },

    get(relativeIndex) {
      return stack[index + relativeIndex];
    },

    /**
     * register a route
     */
    use(path, handler) {
      if (routeMap.some(map => map.path.toString() === path.toString())) {
        console.warn('[route] path already registered:', path);
      } else {
        routeMap.push({
          path,
          matcher: createMatcher(path),
          handler
        });
        routeMap = routeMap.sort((a, b) => b.path.length - a.path.length);
      }
    },

    /**
     * register one or more tasks
     */
    on(eventName, matcher, ...task) {
      if (!tasks[eventName])
        throw new Error(`'${eventName}' is not a valid event name`);

      task = task && task.filter(Boolean);

      if (!task || !task.length) return;

      tasks[eventName].push({
        matcher: createMatcher(matcher),
        task
      });
    }
  };

  function pop({ event }) {
    index = event.state;
  }

  function push({ route }) {
    stack = stack.slice(0, index + 1);
    index++;
    stack.push(route);
    history.pushState(index, route.title, toUrl(route.path, route.query));
  }

  function replace({ route }) {
    stack = stack.slice(0, index + 1);
    stack.splice(index, 1, route);
    history.replaceState(index, route.title, toUrl(route.path, route.query));
  }

  function matchRoutes(eventName) {
    return ({ route, ctx, passive }) => {
      const matched = arrayFind(routeMap, map =>
        map.matcher(route && route.path)
      );

      if (matched && matched.handler[eventName]) {
        route.path = matched.path;
        return runTask([matched.handler[eventName]], {
          route,
          ctx,
          passive
        });
      }
    };
  }

  function persist() {
    save('simplerouter_stack', stack);
    save('simplerouter_index', index);
  }

  function logAfter() {
    log('[after]', { stack, index });
  }

  function logBefore() {
    log('[before]', { stack, index });
  }
} // TODO es6

function filterTask(route, tasks) {
  return tasks.filter(
    task => (task.matcher ? task.matcher((route && route.path) || '') : true)
  );
}

function runTask(tasks, params) {
  return tasks
    .map(t => (t.task ? t.task : t))
    .reduce((prev, cur) => prev.concat(cur), []) // flatten
    .reduce((prev, cur) => prev.then(() => cur(params)), Promise.resolve());
}

function getBasePath() {
  return (
    location.pathname
      .split('/')
      .slice(0, -window.url_base.split('../').length)
      .join('/') + '/'
  );
}

function getCurrentPath() {
  return location.pathname.replace(basePath, '');
}

function toUrl(path, query = {}) {
  const trimed = Object.keys(query)
    .filter(
      key =>
        query[key] != null &&
        query[key] !== '' &&
        ['string', 'number'].indexOf(typeof query[key]) !== -1
    )
    .reduce((prev, cur) => {
      prev[cur] = query[cur];
      return prev;
    }, {});
  const queryStr = qs.build(trimed);
  if (path) {
    return basePath + path + (queryStr === '' ? '' : '?' + queryStr);
  } else {
    return queryStr === '' ? '' : '?' + queryStr;
  }
}

function log(...args) {
  // console.info('[router]', ...args.map(s => JSON.stringify(s, ' ', 2)));
}

function createMatcher(matcher) {
  return typeof matcher === 'string'
    ? path => path && path.indexOf(matcher) === 0 // TODO
    : matcher instanceof RegExp ? path => matcher.test(path) : matcher; // TODO
}

function arrayFind(arr, predicate) {
  let i = 0;
  while (i < arr.length && !predicate(arr[i]))
    i++;
  return arr[i];
}
