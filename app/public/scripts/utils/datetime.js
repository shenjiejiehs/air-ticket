// modularized event tracking and timing tracking



var ONE_DAY = 24 * 3600 * 1000;

var ONE_MINUTE = 60 * 1000;

var ONE_HOUR = 3600 * 1000;

var DATE_NOW = new Date();

var TODAY = ensureDate(formatDate(DATE_NOW, true));

function ensureDate(input) {
  if (typeof input == 'number') {
    var date = new Date();
    date.setTime(input);
    return date;

  } else if (typeof input == 'string') {
    var parts = input.split(/[^\d]+/).filter(Boolean).map(function(p){
      p = Number(p);
      return p !== p ? 0 : p;
    });

    if(parts.length >= 3){
      return new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0);
    }
  } else if (input instanceof Date) {
    return input;
  }
}

function now() {
  return Date.now ? Date.now() : (new Date()).getTime();
}

function parse(inputDate) {
  return ensureDate(inputDate);
}

function formatDate(inputDate, isFull, separator) {
  inputDate = ensureDate(inputDate);

  if (!inputDate) {
    return '';
  }

  var output = [];

  if (isFull) {
    output.push(inputDate.getFullYear());
  }

  var month = (inputDate.getMonth() + 1);
  output.push((month < 10) ? '0' + month : month);

  var date = inputDate.getDate();
  output.push((date < 10) ? '0' + date : date);

  return output.join(separator || '-');
}

function formatDatetime(inputDate, isFull) {
  inputDate = ensureDate(inputDate);

  if (!inputDate) {
    return '';
  }

  return formatDate(inputDate, isFull) + ' ' + formatTime(inputDate);
}

function formatLocalDate(inputDate, isShort) {
  inputDate = ensureDate(inputDate);

  if (!inputDate) {
    return '';
  }

  var output = [];
  var month = (inputDate.getMonth() + 1);
  var date = inputDate.getDate();

  output.push(month + '月' + date + '日');

  if (isShort) {
    return output.join('');
  }

  output.push('(' + formatWeek(inputDate) + ')');

  return output.join('');
}

function formatLocalDatetime(inputDate) {
  inputDate = ensureDate(inputDate);

  if (!inputDate) {
    return '';
  }

  return formatLocalDate(inputDate) + ' ' + formatTime(inputDate);
}

function formatWeek(inputDate, prefix) {
  inputDate = ensureDate(inputDate);

  prefix = prefix || '星期';
  if (!inputDate) {
    return '';
  }

  var weekStr = ['日', '一', '二', '三', '四', '五', '六'];

  return prefix + weekStr[inputDate.getDay()];
}

function isToday(date) {
  var inputDate = ensureDate(date);
  return inputDate.getFullYear() === DATE_NOW.getFullYear() && inputDate.getMonth() === DATE_NOW.getMonth() && inputDate.getDate() === DATE_NOW.getDate();
}

function formatTime(inputDate, addSeconds) {
  inputDate = ensureDate(inputDate);

  if (!inputDate) {
    return '';
  }

  var output = [];

  var hours = inputDate.getHours();
  output.push((hours < 10) ? '0' + hours : hours);

  var minutes = inputDate.getMinutes();
  output.push((minutes < 10) ? '0' + minutes : minutes);

  if (addSeconds) {
    var seconds = inputDate.getSeconds();
    output.push((seconds < 10) ? '0' + seconds : seconds);
  }

  return output.join(':');
}

function caculateDuration(startDatetime, endDatetime) {
  startDatetime = ensureDate(startDatetime);
  endDatetime = ensureDate(endDatetime);

  if (!startDatetime || !endDatetime) {
    return '';
  }

  var diffDatetime = new Date(endDatetime - startDatetime);
  var diffDate = diffDatetime.getUTCDate() - 1;
  var diffHour = diffDatetime.getUTCHours();
  var diffMinutes = diffDatetime.getUTCMinutes();

  if (diffMinutes) {
    return diffDate * 24 + diffHour + '小时' + diffMinutes + '分钟';
  } else {
    return diffDate * 24 + diffHour + '小时';
  }
}

function getMonthName(month) {
  var _month = Number(month);
  if (isNaN(_month) || (_month < 1 || _month > 12)) {
    return "";
  }
  var monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  return monthNames[_month - 1];
}

//日期对比
function compareDay(left, right) {
  return this.compare(left, right, 'date');
}

//option: 'date' | 'time'
function compare(left, right, option) {
  var leftDate = ensureDate(left),
    rightDate = ensureDate(right);
  if (!leftDate || !rightDate) return null;

  if (option === 'date' || option === 'd') {
    leftDate = ensureDate(formatDate(leftDate, true));
    rightDate = ensureDate(formatDate(rightDate, true));
  }
  return leftDate.getTime() - rightDate.getTime();
}

function diffDay(left, right) {
  var leftDate = ensureDate(left),
    rightDate = ensureDate(right);

  return Math.ceil((rightDate - leftDate) / ONE_DAY);
}

module.exports = {
  TODAY: TODAY,
  ONE_DAY: ONE_DAY,
  ONE_HOUR: ONE_HOUR,
  ONE_MINUTE: ONE_MINUTE,
  now: now,
  parse: parse,
  isToday: isToday,
  formatDate: formatDate,
  formatDatetime: formatDatetime,
  formatTime: formatTime,
  formatWeek: formatWeek,
  formatLocalDate: formatLocalDate,
  formatLocalDatetime: formatLocalDatetime,
  getMonthName: getMonthName,
  caculateDuration: caculateDuration,
  compare: compare,
  compareDay: compareDay,
  diffDay: diffDay
};
