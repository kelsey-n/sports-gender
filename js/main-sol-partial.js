const margin = {top: 45, right: 30, bottom: 50, left: 80};
const width = 600; // Total width of the SVG parent
const height = 600; // Total height of the SVG parent
const padding = 1; // Vertical space between the bars of the histogram
const barsColor = 'steelblue';

// Load data here
d3.csv('path_to_data').then(data => {
  console.log('data', data);
  
  // Format and isolate earnings
  const earnings = [];
  data.forEach(datum => {
    // Earnings: Remove commas and convert to integer
    datum.earnings_USD_2019 = ... ;
    earnings.push(datum.earnings_USD_2019);
  });

  createHistogram(earnings);
});


// Create Visualization
const createHistogram = (earnings) => {

  // Generate Bins
  const bins = d3.bin()('pass data here');
  console.log('bins', bins);


  // Append svg
  const svg = d3.select('#viz')  
    .append('svg')
      .attr('viewbox', ...)
      .attr('width', ...)
      .attr('height', ...);


  // Create Scales
  const xScale = d3.scaleLinear()
    .domain()
    .range();
  const yScale = d3.scaleLinear()
    .domain()
    .range(); // Vertical position is calculated Top to Bottom in the svg world
    

  // Append x-axis
  const xAxis = d3.axisBottom( call your scale here )
    .ticks( ... );
  const xAxisGroup = svg
    .append('g')
      .attr('class', 'x-axis-group')
      .attr('transform', `translate( ... , ... )`)
      .style('font-size', '13px')
    .call( call your axis here );

  // Append y-axis
  const yAxis = d3.axisLeft( call your scale here )
    .ticks( ... )
    .tickSizeOuter( ... );
  const yAxisGroup = svg
    .append('g')
      .attr('class', 'y-axis-group')
      .attr('transform', `translate( ... , ... )`)
      .style('font-size', '13px')
    .call( call your axis here );
  yAxisGroup
    .append('text')
      .attr('text-anchor', 'start')
      .attr('x', ... ) // Need to take into account the horizontal translation that was already applied to xAxisGroup
      .attr('y', ... )
      .text('Earnings of the top tennis players in 2019 (USD)')
      .attr('fill', '#3B3B39')
      .style('font-size', '16px')
      .style('font-weight', 700);


  // Append rects
  svg
    .append('g')
      .attr('class', 'bars-group')
      .attr('fill', barsColor)
    .selectAll('rect')
    .data(bins)
    .join('rect')
      .attr('x', ... )
      .attr('y', d => ... )
      .attr('width', d => ... ) // The svg width is the horizontal length of each rectangle, which is relative to the number of datapoints in each bin
      .attr('height', d => ... );


  // Append curve on histogram

  // Add one point at the beginning and at the end of the curve that meets the y-axis
  // Each point added below consist in an array of the coordinates [x, y] of the added point
  bins.unshift([0, 0]); // x = 0, y = 0 (numbers based on the histogram axes)
  bins.push([0, 17000000]); // x = 0, y = 17,000,000 (numbers based on the histogram axes)
  console.log('bins expanded', bins);

  const curveGenerator = d3.line()
    .x((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        // If this is the first or the last element of the bins array, the first number (d[0]) represents the x position
        return ... ;
      } else {
        // Otherwise, the x position is relative to the length of the bin (the tip of the histogram bar)
        return ... ;
      }
    })
    .y((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        // If this is the first or the last element of the bins array, the second number (d[1]) represents the y position
        return ... );
      } else {
        // Otherwise, the y position is relative to the half-height of the histogram bar
        return ... ;
      }
    })
    .curve( ... );

  svg
    .append('path')
      .attr('d', ... )
      .attr('fill', 'none')
      .attr('stroke', 'magenta')
      .attr('stroke-width', 2);


  // Append area on histogram (density plot)

  const areaGenerator = d3.area()
    .x0(margin.left)
    .x1((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        return ... ;
      } else {
        return ... ;
      }
    })
    .y((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        return ... ;
      } else {
        return ... ;
      }
    })
    .curve( ... );
    
  svg
    .append('path')
      .attr('d', ... )
      .attr('fill', 'yellow')
      .attr('fill-opacity', 0.4)
      .attr('stroke', 'none');

};


// Create Split Violin Plot
const createViolin = () => {
  
};

