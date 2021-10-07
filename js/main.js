const margin = {top: 45, right: 30, bottom: 50, left: 80};
const width = 600; // Total width of the SVG parent
const height = 600; // Total height of the SVG parent
const padding = 1; // Vertical space between the bars of the histogram
const barsColor = 'steelblue';
const colorWomen = '#A6BF4B';
const colorMen = '#F2C53D'

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

  // createHistogram(earnings);

  createViolin(data)
});


// Function to create Histogram
const createHistogram = (earnings) => {

  binfunc = d3.bin().thresholds(17)
  const bins = binfunc(earnings);

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
        return(xScale(d[0]) + margin.left);
      } else {
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
const createViolin = (data) => {
  // separate data into men and women
  earnings_men = [];
  earnings_women = [];
  data.forEach(function(item) {
    if (item.gender === 'men') {
      earnings_men.push(item.earnings_USD_2019)
    }
    else if (item.gender === 'women') {
      earnings_women.push(item.earnings_USD_2019)
    }
  });
  men_binfunc = d3.bin().thresholds(17)
  women_binfunc = d3.bin().thresholds(12)
  const men = men_binfunc(earnings_men);
  const women = women_binfunc(earnings_women);

  const halfWidth = (width - margin.right - margin.left) / 2

  const xScale = d3.scaleLinear()
     .domain([0, Math.max(d3.max(men.map(bin => bin.length)), d3.max(women.map(bin => bin.length)))]) // In our data, domain is 0 up to the number of data points contained in the longest bin
     .range([0, halfWidth]) // Based on the space available within the SVG parents, minus the margins
     .nice()

  const yScale = d3.scaleLinear()
     .domain([0, Math.max(d3.max(men.map(bin => bin.x1)), d3.max(women.map(bin => bin.x1)))]) // In our data, domain is 0 up to the upper boundary (x1) of the last bin
     .range([height - margin.bottom,  margin.top]) // Based on the vertical space available within the SVG parent, minus the margins

  // add x axis
  histogramChart
    .append('line')
      .attr('x1', margin.left)
      .attr('y1', height - margin.bottom)
      .attr('x2', width - margin.right)
      .attr('y2', height - margin.bottom)
      .style('stroke', 'black')

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

  // Add data points for the min and max values to each set of bins
  men.unshift([0, 0]);
  men.push([0, 17000000]);
  women.unshift([0, 0]);
  women.push([0, 12000000]);

  const menAreaGenerator = d3.area()
    .y((d, i) => {
      if (i === 0 || i === (men.length - 1)) {
        // If this is the first or the last element of the bins array, the second number (d[1]) represents the y position
        return(yScale(d[1]));
      } else {
        // Otherwise, the y position is relative to the half-height of the histogram bar
        return(yScale(d.x1) + (yScale(d.x0) - yScale(d.x1) - padding) / 2);
      }
    })
    .x0(margin.left + halfWidth)
    .x1((d, i) => {
      if (i === 0 || i === (men.length - 1)) {
        return(xScale(d[0]) + margin.left + halfWidth);
      } else {
        return(xScale(d.length) + margin.left + halfWidth);
      }
    })
    .curve(d3.curveCatmullRom);

    histogramChart
      .append('path')
        .attr('d', menAreaGenerator(men))
        .attr('fill', '#F2C53D')
        .attr('fill-opacity', 0.8)
        .attr('stroke', 'none')
        .style('filter', 'url(#glow)') // add the glow effect that we define below

  const womenAreaGenerator = d3.area()
    .y((d, i) => {
      if (i === 0 || i === (women.length - 1)) {
        // If this is the first or the last element of the bins array, the second number (d[1]) represents the y position
        return(yScale(d[1]));
      } else {
        // Otherwise, the y position is relative to the half-height of the histogram bar
        return(yScale(d.x1) + (yScale(d.x0) - yScale(d.x1) - padding) / 2);
      }
    })
    .x0(margin.left + halfWidth)
    .x1((d, i) => {
      if (i === 0 || i === (women.length - 1)) {
        return(-xScale(d[0]) + margin.left + halfWidth);
      } else {
        return(-xScale(d.length) + margin.left + halfWidth);
      }
    })
    .curve(d3.curveCatmullRom);

    histogramChart
      .append('path')
        .attr('d', womenAreaGenerator(women))
        .attr('fill', '#A6BF4B')
        .attr('fill-opacity', 0.8)
        .attr('stroke', 'none')
        .style('filter', 'url(#glow)') // add the glow effect that we define below

    // Add individual players to the visualization

    const circlesRadius = 2.5; // the radius of each circle
    const circlesPadding = 0.7; // the padding between circles
    const violinSymmetryAxisPosition = margin.left + halfWidth;

    const simulation = d3.forceSimulation(data)
      .force('forceX', d3.forceX(violinSymmetryAxisPosition) //position circles around violin plot's centerline
        .strength(0.1))
      .force('forceY', d3.forceY(d => yScale(d.earnings_USD_2019)) //positions the circles on the earnings axis (y) and has a stronger force, which will ensure that the circles’ y position is proportional to their earning attribute
        .strength(10))
      .force('collide', d3.forceCollide(circlesRadius + circlesPadding)) //how close the centers of the circles can be from one another
      .force('axis', () => {
        // Loop through each data point
        data.forEach(d => {

          // If man and the circle's x position is on the left side of the violin
          if (d.gender === 'men' && d.x < violinSymmetryAxisPosition + circlesRadius) {
            // Increase velocity toward the right
            d.vx += 0.004 * d.x;
          }

          // If woman and the circle's x position is on the right side of the violin
          if (d.gender === 'women' && d.x > violinSymmetryAxisPosition - circlesRadius) {
            // Increase velocity toward the left
            d.vx -= 0.004 * d.x;
          }
        })
      })
      .stop() //stops the internal simulation timer and returns the simulation
      .tick(300); //A tick is an iteration of the simulation, and here we ask D3 to make 300 iterations. With every iteration, the simulation calculates the position of each circle. Then, in the following iteration, it starts from the previously calculated position and refines it.

   // add a group for the circles
   const circles = histogramChart
     .append('g')
       .selectAll('circle')
       .data(data)
       .join('circle')
         .attr('cx', d => d.x)
         .attr('cy', d => d.y)
         .attr('r', circlesRadius)
         .attr('fill-opacity', 0.6)
         .attr('fill', d => d.gender === 'men' ? '#BF9B30' : '#718233')
         .attr('stroke', d => d.gender === 'men' ? '#BF9B30' : '#718233')

  d3.selectAll('circle')
   .on('mouseover', (e, d) => {
      handleMouseOver(e, d);
   })
   .on('mouseout', d => handleMouseOut());

  var tooltip = d3.select('div.tooltip')

  function handleMouseOver(e, d) {
    // populate the divs inside the tooltip with the relevant info
    tooltip.select('.name').text(d.name)
    tooltip.select('.home').text(d.country)
    tooltip.select('.salary').text(d3.format('0.4s')(d.earnings_USD_2019))

    // set the top and left position of the tooltip
    tooltip
      .style('top', `${e.pageY + 10}px`)
      .style('left', `${e.pageX + 10}px`)

    // Add the class visible to the tooltip, which will set its opacity property to 100% (as you can see in the main.css file)
    tooltip.classed('visible', true)
  };

  function handleMouseOut() {
    tooltip.classed('visible', false)
  };

  // Add legend
  const legendWidth = 30;
  const legendHeight = 15;
  const legend = histogramChart
    .append('g')
      .attr('class', 'legend-group')
      .attr('transform', `translate(${margin.left + 20}, ${margin.top + 10})`);
  legend
    .append('rect')
      .attr('y', 0)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', colorWomen);
  legend
    .append('rect')
      .attr('y', legendHeight + 5)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', colorMen);
  legend
    .append('text')
      .attr('x', legendWidth + 7)
      .attr('y', 12)
      .style('font-size', '14px')
      .text('Women');
  legend
    .append('text')
      .attr('x', legendWidth + 7)
      .attr('y', legendHeight + 18)
      .style('font-size', '14px')
      .text('Men');

  // Append container for the effect: defs
  const defs = histogramChart.append('defs');

  // Add filter for the glow effect
  const filter = defs
     .append('filter')
        .attr('id', 'glow');
  filter
     .append('feGaussianBlur')
        .attr('stdDeviation', '3.5')
        .attr('result', 'coloredBlur');
  const feMerge = filter
     .append('feMerge');
  feMerge.append('feMergeNode')
     .attr('in', 'coloredBlur');
  feMerge.append('feMergeNode')
     .attr('in', 'SourceGraphic');

};
