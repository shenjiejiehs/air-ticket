const m = require('m-react');
const redraw = require('../../../utils/hookRedraw');
const Header = require('components/header');
const SelectDestPage = require('../../services/selectDestPage');
const Special = require('../../services/special');

require('css/flex.css');
require('./index.css');

const Page = {
  title: '请选择目的地',

  componentWillUnmount(e) {
    setTimeout(() => {
      if (SelectDestPage.resolve) {
        SelectDestPage.resolve(null);
        SelectDestPage.resolve = null;
      }
    }, 200);
  },

  onInput(e) {
    clearTimeout(SelectDestPage.searchTimer);
    SelectDestPage.search = e.target.value;
    if (SelectDestPage.search.length) {
      SelectDestPage.isSearching = true;
      SelectDestPage.searchTimer = setTimeout(function() {
        m.redraw();
        SelectDestPage.fetchResult().then(
          () => {
            SelectDestPage.isSearching = false;
            m.redraw();
          },
          e => {
            SelectDestPage.isSearching = false;
            m.redraw();
            throw e;
          }
        );
      }, 300);
    } else {
      SelectDestPage.isSearching = false;
    }
  },

  onSelectCity(code, name) {
    if (SelectDestPage.resolve) {
      SelectDestPage.resolve({
        code,
        name
      });
      SelectDestPage.resolve = null;
    }
  },

  render: function() {
    const City = city =>
      m(
        '.result.hl-box-border-bottom',
        {
          onclick: redraw(() => this.onSelectCity(city.cityCode, city.cityName))
        },
        [
          m('.fx-v-center', [
            m('.hl-margin-right', city.cityName),
            m(
              '.hl-text-sm.hl-text-gray',
              city.cityAirportsName.replace(/\|/g, '/')
            )
          ]),
          m(
            '.fx-v-center',
            m(
              '.hl-text-xs.hl-text-gray',
              `${city.cityName} | ${city.cityAirportsCode.replace(/\|/g, '/')}`
            )
          )
        ]
      );

    return m('#special-select-dest', [
      m(Header, {
        title: { org: '请选择出发地', dst: '请选择目的地' }[SelectDestPage.type]
      }),

      m('.search-bar', [
        m('.search-input.fx-v-center', [
          m('.icon-search'),
          m('input.fx-1.hl-text-sm', {
            type: 'text',
            value: SelectDestPage.search,
            oninput: redraw(e => this.onInput(e)),
            placeholder: '国内/国际城市中英文或拼音'
          })
        ])
      ]),

      SelectDestPage.search === ''
        ? // 没有搜索，提供推荐
          [
            SelectDestPage.type === 'org'
              ? // 附近城市
                Special.curCityCode && [
                  m('.heading.hl-text-sm', '附近'),
                  m('.suggestion-list.hl-text-sm', [
                    m(
                      '.suggestion-wrapper',
                      m(
                        '.suggestion.fx-center',
                        {
                          onclick: redraw(() =>
                            this.onSelectCity(
                              Special.curCityCode,
                              Special.curCityName
                            )
                          )
                        },
                        [m('.icon-location'), Special.curCityName]
                      )
                    )
                  ])
                ]
              : // 推荐关键词
                Special.cityFuzzy &&
                Special.cityFuzzy.datas && [
                  m('.heading.hl-text-sm', '推荐'),
                  m(
                    '.suggestion-list.hl-text-sm',
                    Special.cityFuzzy.datas
                      .sort((a, b) => a.display_order - b.display_order)
                      .map(fuzzy =>
                        m(
                          '.suggestion-wrapper',
                          m(
                            '.suggestion.fx-center' +
                              (fuzzy.fuzzy_cn.length > 6 ? '.hl-text-xs' : ''),
                            {
                              onclick: redraw(() =>
                                this.onSelectCity(fuzzy.fuzzy, fuzzy.fuzzy_cn)
                              )
                            },
                            fuzzy.fuzzy_cn
                          )
                        )
                      )
                      .filter(Boolean)
                      .slice(0, 6)
                  )
                ],

            // 国内热门
            SelectDestPage.hotCities &&
            SelectDestPage.hotCities.length && [
              m('.heading.hl-text-sm', '国内热门'),
              m('.result-list', SelectDestPage.hotCities.map(City))
            ]
          ]
        : // 搜索中
          SelectDestPage.searchResult.length
          ? m('.result-list', SelectDestPage.searchResult.map(City))
          : SelectDestPage.isSearching
            ? m('.searching.hl-text-sm.hl-text-gray.hl-text-center', '正在查询')
            : m(
                '.no-result.hl-text-sm.hl-text-gray.hl-text-center',
                '没找到任何结果，换个关键词试试吧'
              )
    ]);
  }
};
module.exports = m.createComponent(Page);
