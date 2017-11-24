const m = require('m-react');
const redraw = require('../../../utils/hookRedraw');
const geolocation = require('../../../utils/geolocation');
const Header = require('components/header');
const Swiper = require('../../../components/swiper/index');
const TripDateFilter = require('../../components/tripDateFilter/index');
const TripList = require('../../components/tripList/index');
const TripDate = require('../../services/tripDate');
const Special = require('../../services/special');
const HomePage = require('../../services/homePage');
const LocationQuery = require('../../../utils/simpleRouter/locationQuery');
const router = require('../../../utils/simpleRouter');
const share = require('../../../utils/share');
const nativeApi = require('../../../utils/nativeApi');
const env = require('../../../utils/env');

require('css/flex.css');
require('./index.css');

let isNative;

nativeApi
  .isAvail()
  .then(isAvail => (isNative = isAvail))
  .then(() => m.redraw());

const Page = {
  title: '特价机票',

  componentDidMount(el) {
    if (!Special.curCityCode) {
      geolocation
        .getNearbyCities()
        .then(result => {
          if (result && result.length) {
            const nearest = result[0].city;
            if (nearest) {
              Special.curCityName = nearest.cityName;
              Special.curCityCode = nearest.cityCode;
              HomePage.curCityPrompt = true;
              m.redraw();
              return Special.fetchHome({ org: Special.curCityCode }).then(() =>
                m.redraw()
              );
            }
          }
        })
        .catch(e => console.warn(e));
    }
  },

  onSelectCurCity(e) {
    e.stopPropagation();
    HomePage.curCityPrompt = false;
    return router.push('special/list', {
      org: Special.curCityCode,
      orgName: Special.curCityName
    });
  },

  onSelectOrg() {
    return new Promise((resolve, reject) =>
      router.push('special/selectDest', {
        type: 'org',
        resolve,
        reject
      })
    ).then(selected => {
      if (selected) {
        const { code, name } = selected;
        return router.replace('special/list', {
          org: code,
          orgName: name
        });
      }
    });
  },

  onSelectDest() {
    return new Promise((resolve, reject) =>
      router.push('special/selectDest', {
        type: 'dst',
        resolve,
        reject
      })
    ).then(selected => {
      if (selected) {
        const { code, name } = selected;
        return router.replace('special/list', {
          dst: code,
          dstName: name
        });
      }
    });
  },

  onSelectTripDate(td) {
    const { month, tag } = td.toOptions();
    HomePage.tripDateVisible = false;
    if (month || tag) {
      return router.push('special/list', {
        month,
        tag
      });
    }
  },

  onCancelTripDate(td) {
    HomePage.tripDateVisible = false;
  },

  onClickBanner(banner) {
    return goToUrl(banner.page_url);
  },

  onClickFlight(f) {
    return router.push('special/detail', {
      org: f.org,
      dst: f.dst,
      month: f.month,
      goback: f.goback,
      selected: f.date,
      selectedPrice: f.price
    });
  },

  onClickMessage(message) {
    if (message.jump_type == 0) {
      if (message.jump_url) {
        return env()
          .then(({ browser }) => {
            const from =
              { hbgj: 'special_hbgj', gtgj: 'special_gtgj' }[browser] ||
              'special_other';
            return Special.reportPromote({
              id: message.id,
              from,
              sp: JSON.stringify({ from })
            });
          })
          .catch(e => {})
          .then(() => goToUrl(message.jump_url));
      }
    } else {
      return nativeApi.isAvail().then(avail => {
        if (avail) {
          const url =
            location.origin + router.resolve('special/promote', message);
          return nativeApi.invoke('createWebView', { url });
        } else {
          return router.push('special/promote', message);
        }
      });
    }
  },

  onToggleTripDateFilter() {
    HomePage.tripDateVisible = !HomePage.tripDateVisible;
  },

  onSwitchTab(i) {
    HomePage.curTab = i;
  },

  render: function() {
    let { home } = Special;

    const titleFiltered = home.datas.title
      .sort((a, b) => a.display_order - b.display_order)
      .filter(title => title.content && title.content.length);

    const tab = titleFiltered[HomePage.curTab];

    const title = ['特价机票', tab.name].filter(Boolean).join('-');

    return m('#special-home', [
      LocationQuery({ curTab: HomePage.curTab }),
      m(Header, {
        // show: 'web',
        title,
        // scrollToShow: true,
        // scrollToShowDistance: 150,
        headerRightBtn: Header.headerRightBtns.share,
        onHeaderRightBtnClick: share({
          title,
          desc: '',
          imgUrl:
            location.origin +
            router.resolve('scripts/special/components/share/share.png')
        })
        // allowBack: isNative
      }),

      // 轮播图
      m(
        '.carousel',
        m(Swiper, {
          slides: home.datas.banner.length
            ? home.datas.banner
                .filter(b => b.page_url)
                .sort((a, b) => a.display_order - b.display_order)
                .map(banner =>
                  m('.slide', {
                    key: banner.page_url,
                    onclick: redraw(() => this.onClickBanner(banner)),
                    style: {
                      'background-image': `url(${banner.icon_url})`
                    }
                  })
                )
            : [
                m(
                  '.slide',
                  {
                    key: 'placeholder'
                  },
                  m(
                    '.fx-center.hl-text-sm.hl-text-gray',
                    {
                      style: { height: '100%' }
                    },
                    '正在加载'
                  )
                )
              ],
          autoPlay: true,
          autoPlayInterval: 1000 * 6
        })
      ),

      // 按出发地/目的地/出行日期
      m('.main-filters.fx-row.fx-m-between', [
        m(
          '.filter.fx-1.fx-col.fx-m-center.fx-c-center',
          {
            onclick: redraw(() => this.onSelectOrg())
          },
          [
            m('.icon-dep'),
            m('.hl-text-sm', '按出发地'),
            m(
              '.hint.fx-center' + (HomePage.curCityPrompt ? '.active' : ''),
              {
                onclick: redraw(e => this.onSelectCurCity(e))
              },
              [m('.icon-location'), m('.text', Special.curCityName)]
            )
          ]
        ),
        m(
          '.filter.fx-1.fx-col.fx-m-center.fx-c-center',
          {
            onclick: redraw(() => this.onSelectDest())
          },
          [m('.icon-arr'), m('.hl-text-sm', '按到达地')]
        ),
        m(
          '.filter.fx-1.fx-col.fx-m-center.fx-c-center' +
            (HomePage.tripDateVisible ? '.active' : ''),
          {
            onclick: redraw(this.onToggleTripDateFilter.bind(this))
          },
          [m('.icon-date'), m('.hl-text-sm', '按出行日期')]
        )
      ]),

      // 选择出发日期
      TripDateFilter({
        isActive: HomePage.tripDateVisible,
        tripDate: TripDate,
        onConfirm: redraw(td => this.onSelectTripDate(td)),
        onCancel: redraw(td => this.onCancelTripDate(td))
      }),

      // TAB和列表
      m('.feeds-wrapper', [
        m(
          '.tabs.fx-row.hl-text-26',
          titleFiltered.map((t, i) =>
            m(
              '.tab.fx-1.fx-center' + (HomePage.curTab == i ? '.active' : ''),
              {
                onclick: redraw(() => this.onSwitchTab(i))
              },
              t.name
            )
          )
        ),

        tab.type == 0
          ? // 消息类
            m(
              '.feeds-container-latest',
              tab.content.map(t =>
                m(
                  '.feed.fx-row',
                  {
                    onclick: redraw(() => this.onClickMessage(t))
                  },
                  [
                    m('.img', {
                      style: {
                        'background-image': `url(${t.pic_url})`
                      }
                    }),
                    m('.detail.fx-1', [
                      m('.title.hl-text-sm', t.reason1),
                      m('.desc.hl-text-gray.hl-text-xs', t.reason2),
                      m('.time.hl-text-gray.hl-text-xs', t.publishdisplay),
                      m('.tags.hl-text-xs', t.tags.map(g => m('.tag', g)))
                    ])
                  ]
                )
              )
            )
          : // 普通类
            m(
              '.feeds-container-specials',
              tab.content.filter(
                content => content.flights && content.flights.length
              ).length
                ? tab.content
                    .filter(
                      content => content.flights && content.flights.length
                    )
                    .map(t =>
                      m('.feed', [
                        m('.heading.fx-center', [
                          m('.icon-theme'),
                          m('.text.fx-1.hl-text-24', t.name)
                          // m('.more.hl-text-xs.fx-center', [
                          //   '更多',
                          //   m('.icon-right')
                          // ])
                        ]),
                        m(
                          '.items',
                          m(
                            '.items-wrapper',
                            (t.flights.length > 3
                              ? [
                                  t.flights.filter((_, i) => !(i % 2)),
                                  t.flights.filter((_, i) => i % 2)
                                ]
                              : [t.flights]
                            ).map(row =>
                              m(
                                '.row',
                                row.map(f =>
                                  m(
                                    '.item.fx-col.fx-m-center.fx-c-center',
                                    {
                                      style: {
                                        'background-image': `linear-gradient(to right, rgba(56, 56, 56, 0.15), rgba(56, 56, 56, 0.15)), url(${f.dstpicurl})`
                                      },
                                      onclick: redraw(() =>
                                        this.onClickFlight(f)
                                      )
                                    },
                                    [
                                      m(
                                        '.title' +
                                          (`${f.orgCityName ||
                                            Special.cityMapping[f.org] ||
                                            f.org} - ${f.dstCityName ||
                                            Special.cityMapping[f.dst] ||
                                            f.dst}`.length > 10
                                            ? '.hl-text-xs'
                                            : '.hl-text-26'),
                                        `${f.orgCityName ||
                                          Special.cityMapping[f.org] ||
                                          f.org} - ${f.dstCityName ||
                                          Special.cityMapping[f.dst] ||
                                          f.dst}`
                                      ),
                                      m(
                                        '.price.hl-text-26',
                                        `￥${f.specialtype == 0
                                          ? f.price
                                          : f.totalprice}` // 国内航线显示不含税价格
                                      )
                                      // m('.tagline.hl-text-22', 'TODO 推广语')
                                    ]
                                  )
                                )
                              )
                            )
                          )
                        )
                      ])
                    )
                : [
                    m('.feed-recommend', [
                      m('.heading.fx-center', [
                        m('.icon-theme'),
                        m('.text.fx-1.hl-text-24', '猜你喜欢')
                      ]),
                      m(
                        '.recommend-items',
                        TripList({
                          tripList: (/国内/.test(tab.name)
                            ? Special.recommendChina
                            : Special.recommendInter
                          ).datas,
                          cityMapping: Special.cityMapping,
                          onSelect: redraw(t => this.onClickFlight(t))
                        })
                      )
                    ])
                  ]
            )
      ])
    ]);
  }
};

module.exports = m.createComponent(Page);

function goToUrl(url) {
  return nativeApi.isAvail().then(avail => {
    if (avail) {
      return nativeApi.invoke('createWebView', { url });
    } else {
      location.assign(url);
    }
  });
}
