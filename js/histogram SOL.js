const margin = {top: 30, right: 20, bottom: 50, left: 60};
const width = 1200;
const height = 600;
const padding = 1;
const color = 'steelblue';

// Load data here
d3.csv('./data/pay_by_gender_tennis.csv').then(data => {
  console.log('data', data);
  
  // Format and isolate earnings
  const earnings = [];
  data.forEach(datum => {
    // Remove commas and convert to integer
    const earning = +datum.earnings_USD_2019.replaceAll(',', '');
    earnings.push(earning);
  });

  createHistogram(earnings);
});


// Create Visualization
createHistogram = (data) => {

  // Generate Bins
  const bins = d3.bin()(data);
  console.log(bins);

  // Create Scales
  const xScale = d3.scaleLinear()
    .domain([bins[0].x0, bins[bins.length - 1].x1])
    .range([margin.left, width - margin.right]);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([height - margin.bottom, margin.top]); // Vertical position is calculated Top to Bottom in the svg world

  // Append svg
  const svg = d3.select('#viz')  
    .append('svg')
      .attr('viewbox', [0, 0, width, height])
      .attr('width', width)
      .attr('height', height);


  // Append x-axis
  const xAxis = d3.axisBottom(xScale)
    .ticks(width / 100)
    .tickSizeOuter(0);
  const xAxisGroup = svg
    .append('g')
      .attr('class', 'x-axis-group')
      .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(xAxis);
  xAxisGroup
    .append('text')
      .attr('text-anchor', 'end')
      .attr('x', width - margin.right)
      .attr('y', 40)
      .text('Earnings in 2019 (USD)')
      .attr('fill', 'black')
      .style('font-size', '15px');

  // Append y-axis
  const yAxis = d3.axisLeft(yScale)
    .ticks(height / 40);
  svg
    .append('g')
      .attr('class', 'y-axis-group')
      .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis);

    
  // Append rects
  svg
    .append('g')
      .attr('class', 'bars-group')
      .attr('fill', color)
    .selectAll('rect')
    .data(bins)
    .join('rect')
      .attr('x', d => xScale(d.x0) + padding) // Take into account padding between rects
      .attr('y', d => yScale(d.length))
      .attr('width', d => xScale(d.x1) - xScale(d.x0) - padding) // Padding to leave space between rects
      .attr('height', d => yScale(0) - yScale(d.length));


  // Append curve on histogram
  const curveGenerator = d3.line()
    .x(d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0) - padding) / 2)
    .y(d => yScale(d.length))
    .curve(d3.curveCatmullRom); 

  svg
    .append('g')
      .attr('class', 'curve-group')
    .append('path')
      .attr('d', curveGenerator(bins))
      .attr('fill', 'none')
      .attr('stroke', 'magenta')
      .attr('stroke-width', 2);


  // Append area on histogram (density plot)
  const areaGenerator = d3.area()
    .x(d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0) - padding) / 2)
    .y0(height - margin.bottom)
    .y1(d => yScale(d.length))
    .curve(d3.curveCatmullRom);

  svg
    .append('g')
      .attr('class', 'area-group')
    .append('path')
      .attr('d', areaGenerator(bins))
      .attr('fill', 'yellow')
      .attr('fill-opacity', 0.4)
      .attr('stroke', 'none');

};

