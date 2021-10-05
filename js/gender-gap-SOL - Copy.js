const margin = {top: 30, right: 20, bottom: 50, left: 60};
const width = 1200;
const height = 600;
const colorMen = '#F2C53D';
const colorWomen = '#A6BF4B';
const colorMenCircles = '#BF9B30';
const colorWomenCircles = '#718233';

// Load data here
d3.csv('./data/pay_by_gender_all.csv').then(data => {

  data.forEach(datum => {
    // Convert earning to number
    datum.earnings_USD_2019 = +datum.earnings_USD_2019.replaceAll(',', '');
  });
  console.log(data);

  createViz(data);
});

// Create Visualization
createViz = (data) => {

  // Create bins for each sport, men and women
  const sports = [ 'basketball', 'golf', 'tennis'];
  const genders = ['men', 'women'];
  const bins = [];

  sports.forEach(sport => {
    genders.forEach(gender => {
      const binsSet = {
        sport: sport,
        gender: gender,
        bins: d3.bin()(data.filter(datum => datum.sport === sport && datum.gender === gender).map(datum => datum.earnings_USD_2019))
      };
      bins.push(binsSet);
    });
  });
  console.log(bins);
  
  // Scales
  const binsMaxLength = d3.max(bins.map(bin => bin.bins), d => d.length);  // We need to know the max length of a bin in order to generate our horizontal domain
  const maxEarning = d3.max(data, d => d.earnings_USD_2019); // We also need to max the max earning in our dataset to generate our vertical domain
  const xMaxLength = 60; // The max horizontal length of each violin. You can adapt this value to your own preference.

  const xScale = d3.scaleLinear()
    .domain([0, binsMaxLength])
    .range([0, xMaxLength]);
  const yScale = d3.scaleLinear()
    .domain([0, maxEarning + 5000000])
    .range([height - margin.bottom, margin.top]);

  // Append svg
  const svg = d3.select('#viz')  
    .append('svg')
      .attr('viewbox', [0, 0, width, height])
      .attr('width', width)
      .attr('height', height);

  // Append x-axis
  const spaceBetweenSports = (width - margin.left - margin.right) / (sports.length + 1);
  const xAxisGroup = svg
    .append('g')
      .attr('class', 'x-axis-group');
  xAxisGroup
    .append('line')
      .attr('class', 'x-axis')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', height - margin.bottom + 1)
      .attr('y2', height - margin.bottom + 1)
      .attr('stroke', 'black');
  xAxisGroup
    .selectAll('.sport-label')
    .data(sports)
    .join('text')
      .attr('x', (d, i) => margin.left + ((i + 1) * spaceBetweenSports))
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text(d => d.charAt(0).toUpperCase() + d.slice(1));

  // Append y-axis
  const yAxis = d3.axisLeft(yScale.nice());
  const yAxisGroup = svg
    .append('g')
      .attr('class', 'y-axis-group')
      .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis);
  yAxisGroup
    .append('text')
      .attr('x', -margin.left)
      .attr('y', 12)
      .text('Earnings in 2019 (USD)')
      .attr('text-anchor', 'start')
      .attr('fill', '#3B3B39') // To compensate for the fill none applied by D3 to the axis group
      .style('font-size', '16px'); // To compensate for the font-size applied by D3 to the axis group
    

  // Append area
  const areaGeneratorMen = d3.area()
    .x0(margin.left)
    .x1(d => margin.left + xScale(d.length))
    .y(d => yScale(d.x1) + ((yScale(d.x0) - yScale(d.x1)) / 2))
    .curve(d3.curveCatmullRom);
  const areaGeneratorWomen = d3.area()
    .x0(d => margin.left - xScale(d.length))
    .x1(margin.left)
    .y(d => yScale(d.x1) + ((yScale(d.x0) - yScale(d.x1)) / 2))
    .curve(d3.curveCatmullRom);

  svg
    .append('g')
      .attr('class', 'violins')
    .selectAll('.violin')
    .data(bins)
    .join('path')
      .attr('class', d => `violin violin-${d.sport} violin-${d.gender}`)
      .attr('d', d => d.gender === 'women' ? areaGeneratorWomen(d.bins) : areaGeneratorMen(d.bins))
      .attr('transform', d => {
        const index = sports.indexOf(d.sport) + 1;
        const translationX = index * spaceBetweenSports;
        return `translate(${translationX}, 0)`; // The margin.left part of the translation is applied in the areaGenerator functions to avoid negative x values for women
      })
      .attr('fill', d => d.gender === 'women' ? colorWomen : colorMen)
      .attr('fill-opacity', 0.8)
      .attr('stroke', 'none');
  
};