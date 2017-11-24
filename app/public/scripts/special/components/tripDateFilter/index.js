const m = require('m-react');
const redraw = require('../../../utils/hookRedraw');
require('./index.css');

module.exports = function TripDateFilter(
  { isActive, tripDate, onConfirm, onCancel } = {}
) {
  return m('.trip-date-filter' + (isActive ? '.active' : ''), [
    m('.mask', { onclick: onCancel }),
    m('.panel', [
      m('.group', [
        m('.heading.hl-text-28', '出行推荐'),
        m('.options.hl-text-28', [
          m(
            '.option-wrapper',
            m(
              '.option.fx-center.fx-1' + (tripDate.weekend ? '.active' : ''),
              {
                onclick: redraw(() => tripDate.weekend = !tripDate.weekend)
              },
              '周末游'
            )
          )
        ])
      ]),
      m('.group', [
        m('.heading.hl-text-28', '出行时间'),
        m('.options.hl-text-28', [
          m(
            '.option-wrapper',
            m(
              '.option.fx-center.fx-1' +
                (tripDate.months.every(month => !month.selected)
                  ? '.active'
                  : ''),
              {
                onclick: redraw(() =>
                  tripDate.months.forEach(month => month.selected = false)
                )
              },
              '不限'
            )
          ),
          ...tripDate.months.map((month, i) =>
            m(
              '.option-wrapper',
              m(
                '.option.fx-center.fx-1' +
                  (tripDate.months[i].selected ? '.active' : ''),
                {
                  onclick: redraw(
                    () =>
                      tripDate.months[i].selected = !tripDate.months[i].selected
                  )
                },
                month.label
              )
            )
          )
        ]),
        m(
          '.confirm.fx-center',
          {
            onclick: redraw(() => onConfirm(tripDate))
          },
          '确定'
        )
      ])
    ])
  ]);
};
