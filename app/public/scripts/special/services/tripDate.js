const TripDate = {
  months: getMonthOptions(),
  weekend: false,
  toOptions
};

module.exports = TripDate;

function getMonthOptions() {
  const curMonth = new Date().getMonth();

  return [0, 1, 2, 3, 4].map(diff => ({
    label: `${(curMonth + diff) % 12 + 1}月`,
    value: (curMonth + diff) % 12 + 1,
    selected: false
  }));
}

function toOptions() {
  return {
    month: this.months
      .filter(m => m.selected)
      .map(m => m.value)
      .filter(Boolean)
      .join(','),
    tag: this.weekend ? 'weekend' : ''
  };
}
