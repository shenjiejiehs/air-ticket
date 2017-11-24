/**
 * 特价机票
 */
const router = require('../utils/simpleRouter');
const show = require('../utils/simpleRouter/show');

const homePage = require('./services/homePage');
const listPage = require('./services/listPage');
const promotePage = require('./services/promotePage');
const detailPage = require('./services/detailPage');
const selectDestPage = require('./services/selectDestPage');

router.use(
  'special',
  show({
    page: 'special/pages/home',
    fetchData: query => homePage.fetchData(query),
    preload: true,
    preloadNext: [
      'special/pages/list',
      'special/pages/promote',
      'special/pages/selectDest'
    ]
  })
);

router.use(
  'special/list',
  show({
    page: 'special/pages/list',
    fetchData: query => listPage.fetchData(query),
    preloadNext: ['special/pages/detail', 'special/pages/selectDest']
  })
);

router.use(
  'special/detail',
  show({
    page: 'special/pages/detail',
    fetchData: query => detailPage.fetchData(query)
  })
);

router.use(
  'special/selectDest',
  show({
    page: 'special/pages/selectDest',
    fetchData: query => selectDestPage.fetchData(query)
  })
);

router.use(
  'special/promote',
  show({
    page: 'special/pages/promote',
    fetchData: query => promotePage.fetchData(query)
  })
);

router.replace();
