const registerRouteHandlers = require('modules/initRoute');
const router = require('utils/router');
const bookPage = require('nanhang1702/substores/bookPage');
const { productId } = window.__pageData__;

// 先初始化Router，后注册路由handler，是为了避免路由初始化的默认跳转就自动将首个页面加载了
// (我们希望手动route)
router.start(); // 这个时候会报警，unhandled route

registerRouteHandlers({ el: '#content' });

bookPage.load({ productId }, { isReplace: true });
