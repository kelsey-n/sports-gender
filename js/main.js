const margin = {top: 45, right: 30, bottom: 50, left: 80};
const width = 600; // Total width of the SVG parent
const height = 600; // Total height of the SVG parent
const padding = 1; // Vertical space between the bars of the histogram
const barsColor = 'steelblue';

const histogramChart = d3.select('#viz')
  .append('svg')
    .attr('width', width)
    .attr('height', height);

// Load data here
d3.csv('../data/pay_by_gender_tennis.csv', d3.autoType).then(data => {
  earnings = [];
  data.forEach(function(item) {
    earnings.push(item.earnings_USD_2019)
  });

  createHistogram(earnings);
});


// Create Histogram
const createHistogram = (earnings) => {

  binfunc = d3.bin().thresholds(17)
  const bins = binfunc(earnings);
  console.log(earnings);

  // Looping version of finding max array length in bins array
  // lengths=[];
  // bins.forEach(function(bin) {
  //   lengths.push(bin.length)
  // })

  const xScale = d3.scaleLinear()
     .domain([0, d3.max(bins.map(bin => bin.length))]) // In our data, domain is 0 up to the number of data points contained in the longest bin
     .range([0, width - margin.left - margin.right]) // Based on the space available within the SVG parents, minus the margins
     .nice()

 const yScale = d3.scaleLinear()
    .domain([0, d3.max(bins.map(bin => bin.x1))]) // In our data, domain is 0 up to the upper boundary (x1) of the last bin
    .range([height - margin.bottom,  margin.top]) // Based on the vertical space available within the SVG parent, minus the margins

  // add x axis
  histogramChart
    .append('g')
       .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
       .call(d3.axisBottom(xScale));

   // add y axis
   histogramChart
     .append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).ticks(17).tickFormat(d3.format('~s'))); // specify 17 ticks on the y axis, and format the ticks

  // add chart label
  histogramChart
    .append('text')
      .attr('x', margin.left - 50)
      .attr('y', margin.top - 25)
      .attr('text-anchor', 'start')
      .style('font-weight', 'bold')
      .text('Earnings of the top tennis players in 2019 (USD)');

  // add group for bars
  const bars = histogramChart
    .append('g')
      .selectAll('rect')
      .data(bins)
      .join('rect')
        .attr('width', d => xScale(d.length))
        .attr('height', d => yScale(d.x0) - yScale(d.x1) - padding)
        .attr('x', margin.left)
        .attr('y', d => yScale(d.x1))
        .attr('fill', barsColor)

  // Append curve on histogram

  // Add one point at the beginning and at the end of the curve that meets the y-axis
  // Each point added below consist in an array of the coordinates [x, y] of the added point
  bins.unshift([0, 0]); // x = 0, y = 0 (numbers based on the histogram axes)
  bins.push([0, 17000000]); // x = 0, y = 17,000,000 (numbers based on the histogram axes)
  console.log('bins expanded', bins);

  // const curveGenerator = d3.line()
  //   .x(d => xScale(d.length) + margin.left) // The x value of the accessor function corresponds to the length of each bar
  //   .y(d => yScale(d.x1) + (yScale(d.x0) - yScale(d.x1) - padding) / 2) // The y value of the accessor function corresponds to the half height of each bar
  //   .curve(d3.curveCatmullRom);

  const curveGenerator = d3.line()
    .x((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        // If this is the first or the last element of the bins array, the first number (d[0]) represents the x position
        return(xScale(d[0]) + margin.left);
      } else {
        // Otherwise, the x position is relative to the length of the bin (the tip of the histogram bar)
        return(xScale(d.length) + margin.left);
      }
    })
    .y((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        // If this is the first or the last element of the bins array, the second number (d[1]) represents the y position
        return(yScale(d[1]));
      } else {
        // Otherwise, the y position is relative to the half-height of the histogram bar
        return(yScale(d.x1) + (yScale(d.x0) - yScale(d.x1) - padding) / 2);
      }
    })
    .curve(d3.curveCatmullRom);

    histogramChart
      .append('path')
        .attr('d', curveGenerator(bins))
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', 'magenta');

  // Add density plot by filling in the area under the curve generated above

  // const areaGenerator = d3.area()
  //   .y((d, i) => {
  //     if (i === 0 || i === (bins.length - 1)) {
  //       // If this is the first or the last element of the bins array, the second number (d[1]) represents the y position
  //       return(yScale(d[1]));
  //     } else {
  //       // Otherwise, the y position is relative to the half-height of the histogram bar
  //       return(yScale(d.x1) + (yScale(d.x0) - yScale(d.x1) - padding) / 2);
  //     }
  //   })
  //   .x0((d, i) => {
  //     if (i === 0 || i === (bins.length - 1)) {
  //       // If this is the first or the last element of the bins array, the first number (d[0]) represents the x position
  //       return(xScale(0) + margin.left);
  //     } else {
  //       // Otherwise, the y position is relative to the half-height of the histogram bar
  //       return(d => xScale(0) + margin.left);
  //     }
  //   })
  //   .x1((d, i) => {
  //     if (i === 0 || i === (bins.length - 1)) {
  //       // If this is the first or the last element of the bins array, the second number (d[1]) represents the y position
  //       return(xScale(d[0]) + margin.left);
  //     } else {
  //       // Otherwise, the y position is relative to the half-height of the histogram bar
  //       return(d => xScale(d.length) + margin.left);
  //     }
  //   })
  //   .curve(d3.curveCatmullRom);

  // const areaGenerator = d3.area()
  //   .y(d => yScale(d.x1) + (yScale(d.x0) - yScale(d.x1) - padding) / 2) // The x value of the accessor function corresponds to the length of each bar
  //   .x0(d => xScale(0) + margin.left) // The y value of the accessor function corresponds to the half height of each bar
  //   .x1(d => xScale(d.length) + margin.left)
  //   .curve(d3.curveCatmullRom);

  const areaGenerator = d3.area()
    .y((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        // If this is the first or the last element of the bins array, the second number (d[1]) represents the y position
        return(yScale(d[1]));
      } else {
        // Otherwise, the y position is relative to the half-height of the histogram bar
        return(yScale(d.x1) + (yScale(d.x0) - yScale(d.x1) - padding) / 2);
      }
    })
    .x0(margin.left)
    .x1((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        // If this is the first or the last element of the bins array, the second number (d[1]) represents the y position
        return(xScale(d[0]) + margin.left);
      } else {
        // Otherwise, the y position is relative to the half-height of the histogram bar
        return(xScale(d.length) + margin.left);
      }
    })
    .curve(d3.curveCatmullRom);

    histogramChart
      .append('path')
        .attr('d', areaGenerator(bins))
        .attr('fill', 'yellow')
        .attr('fill-opacity', 0.4)

};

// Create Split Violin Plot
const createViolin = () => {

};