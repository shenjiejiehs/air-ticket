const createSubstore = require('modules/createSubstore');

module.exports = createSubstore({
  name: 'agreementPage',
  state: {},
  facets: {},
  service: ctrl => ({
    load() {
      return ctrl.signal('::route')({ route: 'nanhang1702/pages/agreement' });
    }
  })
});
