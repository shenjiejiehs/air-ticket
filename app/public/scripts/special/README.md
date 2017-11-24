## 特价机票入口参数

正式服：https://h5.133.cn
测试服：https://wtest.133.cn


1. 首页：
/jipiao/special
URL参数：
curTab: 可选，number, 当前激活的标签页


2. 列表页
/jipiao/special/list
URL参数：
dst: 可选，目的城市三字码
dstName: 目的城市名，需要和dst一同提供（以显示“名山大川”这种模糊标签）
org: 可选，出发城市三字码
orgName: 出发城市名，需要和org一同提供
month: 可选，出发月，形式如  4/5/7 为4,5,7月
cabin: 可选，舱位过滤条件，'all'=不限，'Y=经济舱，'FC'=两舱
tag: 可选，标签，当前只支持'weekend'，为选中周末游

3. 详情页
/jipiao/special/detail
URL参数：
dst: 目的城市三字码
org: 出发城市三字码
month: 可选，出发月，形式如  4/5/7 为4,5,7月
goback： 可选，ow=单程，rt=往返
selected: 可选，当前选中航线的日期，如：'2017-05-03'
from: 可选, 往返航班的最少天数, 默认为1
to: 可选, 往返航班的最大天数, 默认为15

4. 消息详情页
/jipiao/special/promote
URL参数：
id: 消息id

