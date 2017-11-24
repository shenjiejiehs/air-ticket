/**
 * 选项面板
 */
const m = require('m-react');

require('css/flex.css');
require('./index.css');

module.exports = { select };

let container = document.body.appendChild(document.createElement('DIV'));

const OptionPanel = ({ title, options, isActive, onCancel, onSelect }) =>
  m('.option-panel' + (isActive ? '.active' : ''), [
    m('.hl-mask' + (isActive ? '.hl-active' : ''), {
      onclick: onCancel
    }),

    m('.wrapper', [
      title ? m('.title', title) : null,
      m(
        '.option.hl-list-group.hl-list-group-pl',
        options.map((option, i) =>
          m(
            '.hl-list-group-item.fx-center',
            {
              onclick: () => onSelect(option, i)
            },
            [
              m('.hl-inline-block.fx-1', option.desc || option.name),
              option.selected ? m('.hl-inline-block.icon-select') : null
            ]
          )
        )
      )
    ])
  ]);

let resolve;
let params = {
  isActive: false,
  title: '',
  options: [],
  onCancel() {
    params.isActive = false;
    resolve(null);
    redraw();
  },
  onSelect(option) {
    params.isActive = false;
    resolve(option);
    redraw();
  }
};

function select({ title, options }) {
  Object.assign(params, { title, options, isActive: false });
  redraw();

  setTimeout(function() {
    Object.assign(params, { title, options, isActive: true });
    redraw();
  }, 0);

  return new Promise(res => resolve = res);
}

function redraw() {
  m.render(container, OptionPanel(params), false, true);
}
