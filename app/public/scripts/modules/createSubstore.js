const initService = require('./initService');
const map = require('../utils/map');

/**
 * 创建一个'subStore'
 * 参见: http://gitlab.huolih5.com/hangban/team-wiki/wikis/a-state-management-method
 *
 * 在原来service的基础上：
 * - 增加require-and-call调用机制
 * - 调用有返回值
 * - 减少handler入参数量 (ctrl, next, payload)  ->  payload
 */
const createSubstore = ({ name, state, facets, service }) => {
  let services;

  const compatibleService = initService({
    namespace: name,
    data: state,
    facets,
    action: ctrl => {
      // reset store to get rid of stale cache
      ctrl.set(state);

      // inject ctrl
      services = service(ctrl);

      // to invoke service in view(page), use: this.signal('myService.someAction')()
      map(
        (handler, key) =>
        ctrl.signal(key, (ctrl, next, payload) => handler(payload)),
        services
      );
    }
  });

  if (!services) {
    throw new Error('service not initialized');
  }

  // to invoke service in other substore, use: require(myService).someAction()
  map(
    (handler, key) => {
      if (compatibleService[key]) {
        throw new Error(`overriding service.${key}`);
      }
      compatibleService[key] = handler;
    },
    services
  );
  return compatibleService;
};

module.exports = createSubstore;
