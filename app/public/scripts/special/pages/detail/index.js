const m = require('m-react');
const redraw = require('../../../utils/hookRedraw');

const Header = require('components/header');
const RangeSelector = require('../../components/rangeSelector/index');
const Swiper = require('../../../components/swiper/index');
const Special = require('../../services/special');
const DetailPage = require('../../services/detailPage');
const openInApp = require('../../../utils/openInApp');
const nativeApi = require('../../../utils/nativeApi');
const LocationQuery = require('../../../utils/simpleRouter/locationQuery');
const share = require('../../../utils/share');
const env = require('../../../utils/env');
const router = require('../../../utils/simpleRouter');

require('css/flex.css');
require('./index.css');

const LeavingNotice = ({ thirdParty }) =>
  m('.leaving-notice.hl-text-center', [
    m('.icon-loading'),
    m('.hl-text-gray.hl-text-lg', '正在离开航班管家'),
    m(
      '.hl-text-gray.hl-text-lg',
      thirdParty ? `进入"${thirdParty}"网站预订` : '进入第三方网站预订'
    ),
    m(
      '.footer.hl-text-gray.hl-text-sm',
      `我们将无法为您提供服务，如您在预订过程中需要帮助，请联系${thirdParty
        ? `"${thirdParty}"`
        : '第三方网站'}客服`
    )
  ]);

const Page = {
  title: '特价机票',

  $el: null,
  _updateBarPlotHeight: null,

  updateBarPlotHeight() {
    setTimeout(() => {
      const el = this.$el;
      const $barChart = el.querySelector('.bar-chart');
      if ($barChart) {
        const { top } = $barChart.getBoundingClientRect();
        const availHeight = document.documentElement.clientHeight - top;
        DetailPage.barPlotHeight = availHeight - 5;
        m.redraw();
      }
    }, 100);
  },

  componentDidMount(el) {
    this.$el = el;
    this.updateBarPlotHeight();

    this._updateBarPlotHeight = () => this.updateBarPlotHeight();
    window.addEventListener('resize', this._updateBarPlotHeight);
    setTimeout(function centerSelected() {
      const $selected = el.querySelector('.active');
      const $chartWrapper = el.querySelector('.bar-chart-wrapper');
      if ($selected && $chartWrapper) {
        const { left, width } = $selected.getBoundingClientRect();
        $chartWrapper.scrollLeft = left + width / 2 - window.innerWidth / 2;
      }
    }, 0);
  },

  componentWillUnmount(el) {
    window.removeEventListener('resize', this._updateBarPlotHeight);
  },

  onSwitchGoback() {
    DetailPage.goback = DetailPage.goback === 'ow' ? 'rt' : 'ow';
    return DetailPage.refresh().then(() => this.updateBarPlotHeight());
  },

  onSelectDate(flight) {
    // 当前日期和航班一一对应
    DetailPage.selected = flight;
    return this.updateBarPlotHeight();
  },

  onSelectFlight(flight) {
    if (flight.canorder == 0) {
      // 管家订票
      return env().then(({ browser }) => {
        const from =
          { hbgj: 'special_hbgj', gtgj: 'special_gtgj' }[browser] ||
          'special_other';

        const opts = {
          type: 'ticketlist',
          scty: flight.org,
          ecty: flight.dst,
          fdate: flight.date,
          fben: flight.gocabin,
          sp: JSON.stringify({ from })
        };

        if (flight.goback === 'rt') {
          opts.arrdate = flight.rdate;
        }

        return openInApp(opts);
      });
    } else {
      // 第三方订票
      DetailPage.isLeaving = true;
      DetailPage.thirdParty = flight.srcdisplay;

      setTimeout(function() {
        goToUrl(flight.orderurl);
      }, 2000);

      setTimeout(function() {
        DetailPage.isLeaving = false;
      }, 5000);
    }
  },

  onChangeRange({ from, to }) {
    Object.assign(DetailPage, { from, to });
    return DetailPage.refresh().then(() => this.updateBarPlotHeight());
  },

  render: function() {
    const getPrice = flight =>
      ({ 0: flight.price, 1: flight.totalprice }[flight.specialtype]);

    const getDate = (flight, inbound = false) => {
      const [year, month, date] = flight[inbound ? 'rdate' : 'date']
        .split('-')
        .map(num => parseInt(num, 10));
      const day = ['一', '二', '三', '四', '五', '六', '日'][
        flight[inbound ? 'rweek' : 'week'] - 1
      ];
      return `${month}月${date}日 周${day}`;
    };

    const maxPrice = Math.max(
      ...Special.detail.datas.content.map(month =>
        Math.max(
          ...[month.avg_year, month.avg_month, ...month.m_content.map(getPrice)]
        )
      )
    );
    const minPrice = Math.min(
      ...Special.detail.datas.content.map(month =>
        Math.min(...month.m_content.map(getPrice))
      )
    );
    const maxHeight = DetailPage.barPlotHeight * 0.6;
    const minHeight = 30;

    const toHeight = price => {
      return (
        minHeight +
        (price - minPrice) *
          (maxHeight - minHeight) /
          (maxPrice - minPrice || 0.001)
      );
    };
    const mapping = Special.cityMapping;

    const orgName = mapping[DetailPage.org];
    const dstName = mapping[DetailPage.dst];
    const title = [
      '特价机票',
      orgName && dstName
        ? `${orgName}到${dstName}`
        : orgName ? '从' + orgName + '出发' : dstName ? '目的地' + dstName : ''
    ]
      .filter(Boolean)
      .join('-');

    const min = Special.detail.datas.interval_min || 1;
    const max = Special.detail.datas.interval_max || 15;

    const selected = DetailPage.selected;

    return m('#special-detail', [
      LocationQuery({
        dst: DetailPage.dst,
        org: DetailPage.org,
        month: DetailPage.month,
        goback: DetailPage.goback,
        from: DetailPage.from,
        to: DetailPage.to,
        selected: selected && selected.date
      }),

      m(Header, {
        title,
        // show: 'web',
        // tintColor: [65, 192, 242, 1],
        // scrollToShow: true, // 导航栏是透明的，不占高度，回退按钮为白色。随页面上滑而显示导航栏，应该支持native
        // scrollToShowDistance: 10000, // 滑到多少像素时导航栏全
        // useStatusPlaceholder: true,
        headerRightBtn: Header.headerRightBtns.share,
        onHeaderRightBtnClick: share({
          title,
          desc: '',
          imgUrl:
            location.origin +
            router.resolve('scripts/special/components/share/share.png')
        })
      }),

      DetailPage.isLeaving
        ? LeavingNotice({ thirdParty: DetailPage.thirdParty })
        : [
            m('.big-header', [
              m('.roundtrip-switch-container.fx-center', [
                m(
                  '.roundtrip-switch.fx-v-center' +
                    { ow: '.left', rt: '.right' }[DetailPage.goback],
                  {
                    onclick: redraw(() => this.onSwitchGoback())
                  },
                  [
                    m('.label-a.fx-1.fx-center', '单程'),
                    m('.label-b.fx-1.fx-center', '往返'),
                    m('.slider')
                  ]
                )
              ]),

              DetailPage.goback === 'rt' && max > min
                ? m('.date-range.fx-center', [
                    m('.hl-text-white.hl-text-28', '出行天数'),
                    m(RangeSelector, {
                      min,
                      max,
                      from: DetailPage.from || min,
                      to: DetailPage.to || max,
                      step: 1,
                      onChange: redraw(range => this.onChangeRange(range))
                    })
                  ])
                : m(''),

              m(
                '.trip-list',
                m(Swiper, {
                  indicator: false,
                  slides: !selected
                    ? [
                        m(
                          '.trip-card.hl-text-24',
                          {
                            key: 'placeholder'
                          },
                          [
                            m('.heading.fx-center', [
                              m('.from', Special.cityMapping[DetailPage.org]),
                              m('.icon-arrow'),
                              m('.to', Special.cityMapping[DetailPage.dst])
                            ]),
                            m('.content.fx-center', [m('.icon-sad-plane')])
                          ]
                        )
                      ]
                    : [
                        m(
                          '.trip-card.hl-text-24',
                          {
                            onclick: redraw(() =>
                              this.onSelectFlight(selected)
                            ),
                            key:
                              selected.org +
                              selected.dst +
                              selected.date +
                              selected.rdate +
                              selected.src
                          },
                          [
                            m('.heading.fx-center', [
                              m('.from', Special.cityMapping[selected.org]),
                              m('.icon-arrow'),
                              m('.to', Special.cityMapping[selected.dst])
                            ]),
                            m('.content.fx-center', [
                              m('.left.hl-text-26', [
                                m('.outbound.fx-v-center', [
                                  m('.icon-outbound'),
                                  m('', getDate(selected))
                                ]),
                                selected.goback === 'rt' &&
                                  m('.inbound.fx-v-center', [
                                    m('.icon-inbound'),
                                    m('', getDate(selected, true))
                                  ])
                              ]),

                              m('.right.fx-1', [
                                m(
                                  '.price.hl-text-32' +
                                    (selected.sale_status == 0
                                      ? '.soldout'
                                      : ''),
                                  m('span.digit', '￥' + getPrice(selected))
                                ),
                                m(
                                  '.cabin.hl-text-22',
                                  DetailPage.cabinMapping[selected.gobct]
                                ),
                                m(
                                  '.desc.hl-text-22',
                                  { ow: '', rt: '往返' }[selected.goback] +
                                    { 0: '', 1: '含税总价' }[selected.specialtype]
                                )
                              ]),

                              m('.icon-right')
                            ]),

                            selected.canorder == 1 &&
                              m(
                                '.footer.hl-text-xxs',
                                `此价格由${selected.srcdisplay}提供，可在第三方平台继续预订`
                              )
                          ]
                        )
                      ]
                })
              )
            ]),

            Special.detail.datas.content && Special.detail.datas.content.length
              ? m(
                  '.bar-chart',
                  {
                    style: {
                      height: DetailPage.barPlotHeight + 'px'
                    }
                  },
                  [
                    m('.bar-chart-wrapper', [
                      ...Special.detail.datas.content.map(month =>
                        m('.month-price', [
                          m(
                            '.brief-wrapper.fx-v-center',
                            m('.brief', [
                              m(
                                '.month.hl-text-26',
                                [
                                  month.year != new Date().getFullYear() &&
                                    (month.m_content.length < 3
                                      ? month.year % 1000 + '年'
                                      : month.year + '年'),
                                  month.year != new Date().getFullYear() &&
                                    month.m_content.length < 3 &&
                                    m('br'),
                                  month.month + '月'
                                ].filter(Boolean)
                              ),
                              month.avg_month &&
                                month.m_content.length > 3 &&
                                m(
                                  '.average.hl-text-20',
                                  `均价￥${month.avg_month}`
                                )
                            ])
                          ),
                          m(
                            '.day-price-list',
                            month.m_content.map(flight =>
                              m(
                                '.day-price' +
                                  (getPrice(flight) === minPrice
                                    ? '.lowest'
                                    : '') +
                                  (flight.date === (selected && selected.date)
                                    ? '.active'
                                    : ''),
                                {
                                  key: `${flight.date}-${flight.org}-${flight.dst}-${flight.goback}`,
                                  onclick: redraw(() =>
                                    this.onSelectDate(flight)
                                  )
                                },
                                m('.heading', [
                                  m(
                                    '.date.hl-text-24',
                                    flight.date
                                      .split('-')
                                      .pop()
                                      .replace(/^0+/, '')
                                  ),
                                  m(
                                    '.day.hl-text-24',
                                    ['一', '二', '三', '四', '五', '六', '日'][
                                      flight.week - 1
                                    ]
                                  )
                                ]),
                                m(
                                  '.bar',
                                  {
                                    style: {
                                      height: toHeight(getPrice(flight)) + 'px'
                                    }
                                  },
                                  getPrice(flight)
                                )
                              )
                            )
                          )
                        ])
                      )
                    ]),
                    Special.detail.datas.content[0].avg_year &&
                      m(
                        '.year-avg',
                        {
                          style: {
                            transform: `translateY(-${toHeight(
                              Number(Special.detail.datas.content[0].avg_year)
                            )}px)`,
                            webkitTransform: `translate3d(0, -${toHeight(
                              Number(Special.detail.datas.content[0].avg_year)
                            )}px, 0)`
                          }
                        },
                        [
                          m('.wrapper', [
                            m('.title.fx-center', '年度均价'),
                            m(
                              '.price.fx-center',
                              `￥${Special.detail.datas.content[0].avg_year}`
                            )
                          ])
                        ]
                      ),
                    m(
                      '.overall-lowest',
                      {
                        style: {
                          transform: `translateY(-${toHeight(minPrice)}px)`,
                          webkitTransform: `translate3d(0, -${toHeight(
                            minPrice
                          )}px, 0)`
                        }
                      },
                      [m('.price.fx-center', `￥${minPrice}`)]
                    )
                  ]
                )
              : m('.bar-chart-placeholder', [
                  m('.title.hl-text-30', '没有符合条件的特价'),
                  m('.desc.hl-text-24', '换个条件再试试吧')
                ])
          ]
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
