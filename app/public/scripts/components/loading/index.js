const m = require('m-react');
const loadingIcon = require('./loading.svg');

require('./index.css');
require('css/flex.css');

let message = '正在加载';
let count = 0;

module.exports = { show, hide };

function show(msg) {
  count++;
  message = msg;
  refresh();
}

function hide() {
  count--;
  refresh();
}

function refresh() {
  if (count) {
    getContainer().classList.remove('hidden');
    m.render(getContainer(), Loading(message), true, true);
  } else {
    getContainer().classList.add('hidden');
  }
}

function getContainer() {
  let container = document.getElementById('loading-container');
  if (!container) {
    container = document.createElement('DIV');
    container.id = 'loading-container';
    document.body.appendChild(container);
  }
  return container;
}

function Loading(message) {
  message = message || '正在加载';
  if (!message) {
    return m('.loading.fx-center', m('.loading-icon', m.trust(loadingIcon)));
  } else {
    return m(
      '.loading.dark.fx-center',
      m('.wrapper.fx-col.fx-c-center', [
        m('.loading-icon', m.trust(loadingIcon)),
        m('.loading-message', message)
      ])
    );
  }
}
