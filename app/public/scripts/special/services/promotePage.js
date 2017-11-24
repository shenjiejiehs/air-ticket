const Special = require('./special');

const PromotePage = {
  id: null,

  fetchData({ id }) {
    Object.assign(this, {
      id
    });
    return Promise.all([Special.fetchPromote({ id })]);
  }
};

module.exports = PromotePage;
