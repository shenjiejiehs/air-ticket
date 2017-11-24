var calUtil = require('./calendar');
var dateUtil = require('../datetime');

module.exports = function getMonthData(date){
  date = dateUtil.parse(date);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  return genCalendarForMonth([year, month]);
};
//helpers
// constant
// var MONTHS_COUNT = 6; //max : 12
var dayDescPriority = ['solarFestival', 'lunarFestival', 'term'];

// function genCalendar(){
//   var curDate = new Date();
//   var curYear = curDate.getFullYear();
//   var startMonth = curDate.getMonth() + 1;
//   var inputPairs = [], mon;
//   for(var i = 0; i <= MONTHS_COUNT; i++){
//     mon = startMonth + i;
//     if(mon <= 12){
//       inputPairs.push([curYear, mon]);
//     }else{
//       inputPairs.push([curYear+1, mon - 12]);
//     }
//   }
//   return inputPairs.map(genCalendarForMonth);
// }

function genCalendarForMonth(pair){
  var year = pair[0], month = pair[1];
  var rawResult = calUtil.calendar(year, month);
  var result = {};
  result.firstDay = rawResult.firstDay;
  result.year = year;
  result.month = month;
  result.days = rawResult.monthData.map(function(day){
    return {
      date: [year, month, day.day].join('-'),
      day: day.day,
      desc: getDayDesc(day, dayDescPriority)
    };
  });
  return result;
}

function getDayDesc(day, descPriority){
  var result = '';
  var i = 0, l = descPriority.length, key;
  for(; i < l; i++){
    key = descPriority[i];
    if(!!day[key]){
      result = day[key];
      break;
    }
  }
  return result;
}
