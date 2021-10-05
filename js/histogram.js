const margin = {top: 30, right: 20, bottom: 50, left: 60};
const width = 1200;
const height = 600;
const padding = 1;
const color = 'steelblue';

// Load data here
d3.csv('../data/pay_by_gender_tennis.csv', d3.autoType).then(data => {
  earnings = [];
  data.forEach(function(item) {
    earnings.push(item.earnings_USD_2019)
  });
  binfunc = d3.bin().thresholds(17)
  const bins = binfunc(earnings);
  console.log(bins)
});

// Create Histogram
const createHistogram = () => {

};
