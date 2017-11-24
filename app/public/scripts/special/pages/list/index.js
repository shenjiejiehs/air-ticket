const m = require('m-react');
const router = require('../../../utils/simpleRouter');
const Header = require('components/header');
const TripDateFilter = require('../../components/tripDateFilter/index');
const TripList = require('../../components/tripList/index');
const TripDate = require('../../services/tripDate');
const ListPage = require('../../services/listPage');
const Special = require('../../services/special');
const redraw = require('../../../utils/hookRedraw');
const openInApp = require('../../../utils/openInApp');
const LocationQuery = require('../../../utils/simpleRouter/locationQuery');
const optionPanel = require('../../../components/optionPanel/index');
const share = require('../../../utils/share');
const env = require('../../../utils/env');

require('css/flex.css');
require('./index.css');

const Page = {
  title: '特价机票',

  onToggleTripFilter() {
    ListPage.tripDateVisible = !ListPage.tripDateVisible;
  },

  onToggleRegion() {
    ListPage.region = ListPage.region === 'china' ? 'inter' : 'china';
  },

  onUpdate(pair) {
    Object.assign(ListPage, pair);
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
        history.back();
        const { code, name } = selected;
        Object.assign(ListPage, {
          org: code,
          orgName: name
        });
        return ListPage.refresh();
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
        history.back();
        const { code, name } = selected;
        Object.assign(ListPage, {
          dst: code,
          dstName: name
        });
        ListPage.refresh().then(() => m.redraw());
      }
    });
  },

  onSelectTripDate(td) {
    Object.assign(ListPage, td.toOptions());
    ListPage.tripDateVisible = false;
    return ListPage.refresh();
  },

  onCancelTripDate(td) {
    ListPage.tripDateVisible = false;
  },

  onSelectTrip(trip) {
    return router.push('special/detail', {
      org: trip.org,
      dst: trip.dst,
      month: trip.month,
      goback: trip.goback,
      selected: trip.date
    });
  },

  onRetry() {
    return ListPage.refresh();
  },

  onResetFilter() {
    return ListPage.refresh();
  },

  onSearchNormal() {
    // 管家订票
    return env().then(({ browser }) => {
      const from =
        { hbgj: 'special_hbgj', gtgj: 'special_gtgj' }[browser] ||
        'special_other';

      const opts = {
        type: 'ticketlist',
        scty: ListPage.org,
        ecty: ListPage.dst,
        sp: JSON.stringify({ from })
      };

      return openInApp(opts);
    });
  },

  onSelectFilterGoback() {
    return optionPanel
      .select({
        title: '请选择',
        options: [
          {
            name: '单程+往返',
            value: 'all',
            selected: ListPage.goback === 'all'
          },
          {
            name: '单程',
            value: 'ow',
            selected: ListPage.goback === 'ow'
          },
          {
            name: '往返',
            value: 'rt',
            selected: ListPage.goback === 'rt'
          }
        ]
      })
      .then(selected => {
        if (selected) {
          ListPage.goback = selected.value;
          m.redraw();
        }
      });
  },

  onSelectFilterCabin() {
    return optionPanel
      .select({
        title: '选择舱位',
        options: [
          {
            name: '全部舱位',
            value: 'all',
            selected: ListPage.cabin === 'all'
          },
          {
            name: '经济舱',
            value: 'Y',
            selected: ListPage.cabin === 'Y'
          },
          {
            name: '两舱',
            value: 'FC',
            selected: ListPage.cabin === 'FC'
          }
        ]
      })
      .then(selected => {
        if (selected) {
          ListPage.cabin = selected.value;
          m.redraw();
        }
      });
  },

  render: function() {
    const filteredList = (Special.list || [])
      // 国内/国际
      .filter(
        (ListPage.org && ListPage.dst) || !ListPage.region
          ? any
          : t => ({ 0: 'china', 1: 'inter' }[t.specialtype] === ListPage.region)
      )
      // 单程/往返
      .filter(
        !ListPage.goback || ListPage.goback === 'all'
          ? any
          : t => t.goback === ListPage.goback
      )
      // 舱位
      .filter(
        !ListPage.cabin || ListPage.cabin === 'all'
          ? any
          : t => ListPage.cabin.indexOf(t.gobct) !== -1
      )
      // 排序
      .sort(
        ListPage.sortBy === 'price'
          ? ListPage.region === 'china'
            ? (a, b) => a.price - b.price
            : (a, b) => a.totalprice - b.totalprice
          : (a, b) => a.rate - b.rate
      );

    const { orgName, dstName } = ListPage;
    const title = [
      '特价机票',
      orgName && dstName
        ? `${orgName}到${dstName}`
        : orgName ? '从' + orgName + '出发' : dstName ? '去' + dstName : '',
      getTripDateString(ListPage, '')
    ]
      .filter(Boolean)
      .join('-');

    return m('#special-list', [
      LocationQuery({
        dst: ListPage.dst,
        dstName: ListPage.dstName,
        org: ListPage.org,
        orgName: ListPage.orgName,
        month: ListPage.month,
        cabin: ListPage.cabin,
        tag: ListPage.tag
      }),
      m(Header, {
        title,
        headerRightBtn: Header.headerRightBtns.share,
        onHeaderRightBtnClick: share({
          title,
          desc: '',
          imgUrl:
            location.origin +
            router.resolve('scripts/special/components/share/share.png')
        })
      }),

      // 顶部筛选
      m('.top-filters.fx-row.hl-text-xs', [
        m(
          '.filter.fx-1.fx-center',
          {
            onclick: redraw(() => this.onSelectOrg())
          },
          [
            m('.icon-dep'),
            m(
              '.fx-1',
              ListPage.orgName ||
                Special.cityMapping[ListPage.org] ||
                ListPage.org ||
                '出发地'
            ),
            m('.icon-dropdown')
          ]
        ),
        m(
          '.filter.fx-1.fx-center',
          {
            onclick: redraw(() => this.onSelectDest())
          },
          [
            m('.icon-arr'),
            m(
              '.fx-1',
              ListPage.dstName ||
                Special.cityMapping[ListPage.dst] ||
                ListPage.dst ||
                '目的地'
            ),
            m('.icon-dropdown')
          ]
        ),
        m(
          '.filter.fx-1.fx-center' +
            (ListPage.tripDateVisible ? '.active' : ''),
          {
            onclick: redraw(() => this.onToggleTripFilter())
          },
          [
            m('.icon-date'),
            m('.fx-1', getTripDateString(ListPage)),
            m('.icon-dropdown')
          ]
        )
      ]),

      TripDateFilter({
        isActive: ListPage.tripDateVisible,
        tripDate: TripDate,
        onConfirm: redraw(td => this.onSelectTripDate(td)),
        onCancel: redraw(td => this.onCancelTripDate(td))
      }),

      ListPage.error
        ? [
            m('.result-placeholder', [
              m('.icon-placeholder-error'),
              m('.heading.hl-text-30', '服务器开小差了，请稍后重试'),
              m(
                '.button.fx-center',
                {
                  onclick: redraw(() => this.onRetry())
                },
                '重试'
              )
            ])
          ]
        : [
            filteredList && filteredList.length
              ? m(
                  '.trip-list-wrapper',
                  TripList({
                    tripList: filteredList,
                    cityMapping: Special.cityMapping,
                    onSelect: redraw(t => this.onSelectTrip(t))
                  })
                )
              : // 暂无特价
                Special.list && Special.list.length
                ? m('.result-placeholder', [
                    m('.icon-placeholder-discount'),
                    m('.heading.hl-text-30', '没有符合当前过滤条件的数据'),
                    m(
                      '.button.fx-center',
                      {
                        onclick: redraw(() => this.onResetFilter())
                      },
                      '重置过滤条件'
                    )
                  ])
                : m('.result-placeholder', [
                    m('.icon-placeholder-discount'),
                    m('.heading.hl-text-30', '此航班暂无特价'),
                    m('.desc.hl-text-24', '建议直接搜索，可能发现新特价航班哦'),
                    m(
                      '.button.fx-center',
                      {
                        onclick: redraw(() => this.onSearchNormal())
                      },
                      '去搜索，发现特价'
                    )
                  ])
          ],

      // 真没结果
      // m('.result-placeholder', [
      //   m('.icon-placeholder-no-result'),
      //   m('.heading.hl-text-30', '此航线可能还没开通，换个航线试试吧…')
      // ]),

      // 底栏
      !ListPage.error &&
        Special.list &&
        Special.list.length &&
        m('.bottom-bar-wrapper', [
          m('.placeholder'),
          m('.bottom-bar.fx-row', [
            !(Special.dst && Special.org) &&
              [0, 1].every(val =>
                Special.list.some(t => t.specialtype == val)
              ) &&
              m(
                '.region-switch.fx-v-center' +
                  (ListPage.region === 'china' ? '.left' : '.right'),
                {
                  onclick: redraw(() => this.onToggleRegion())
                },
                [
                  m('.label-a.fx-1.fx-center', '国内'),
                  m('.label-b.fx-1.fx-center', '国际'),
                  m('.slider')
                ]
              ),
            m(
              '.tab.fx-1.fx-center.fx-col.price',
              {
                onclick: redraw(() => this.onUpdate({ sortBy: 'price' }))
              },
              [
                m('.icon-price'),
                m(
                  '.desc.hl-text-22',
                  ListPage.sortBy === 'price' ? '价格由低到高' : '价格'
                )
              ]
            ),
            m(
              '.tab.fx-1.fx-center.fx-col.discount',
              {
                onclick: redraw(() => this.onUpdate({ sortBy: 'rate' }))
              },
              [
                m('.icon-discount'),
                m(
                  '.desc.hl-text-22',
                  ListPage.sortBy === 'rate' ? '折扣由高到低' : '折扣'
                )
              ]
            ),
            ['ow', 'rt'].every(val =>
              Special.list.some(t => t.goback === val)
            ) &&
              m(
                '.tab.fx-1.fx-center.fx-col.roundtrip',
                {
                  onclick: () => this.onSelectFilterGoback()
                },
                [
                  m('.icon-roundtrip'),
                  m(
                    '.desc.hl-text-22',
                    { all: '单程+往返', ow: '单程', rt: '往返' }[ListPage.goback]
                  )
                ]
              ),
            ['Y', 'F', 'C'].filter(val =>
              Special.list.some(t => t.gobct === val)
            ).length > 1 &&
              m(
                '.tab.fx-1.fx-center.fx-col.cabin',
                {
                  onclick: () => this.onSelectFilterCabin()
                },
                [
                  m('.icon-cabin'),
                  m(
                    '.desc.hl-text-22',
                    { all: '全部舱位', Y: '经济舱', FC: '两舱' }[ListPage.cabin]
                  )
                ]
              )
          ])
        ])
    ]);
  }
};
module.exports = m.createComponent(Page);

function any() {
  return true;
}

function getTripDateString({ month, tag }, placeholder = '出行时间') {
  if (!month && !tag) return placeholder;
  return [
    tag && '周末游',
    month
      ? month
          .split(',')
          .filter(Boolean)
          .join('/') + '月'
      : ''
  ]
    .filter(Boolean)
    .join('/');
}
