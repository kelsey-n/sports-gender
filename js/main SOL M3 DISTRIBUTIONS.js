const margin = {top: 45, right: 30, bottom: 50, left: 80};
const width = 600; // Total width of the SVG parent
const height = 600; // Total height of the SVG parent
const padding = 1; // Vertical space between the bars of the histogram
const barsColor = 'steelblue';

// Load data here
d3.csv('./data/pay_by_gender_tennis.csv').then(data => {
  console.log('data', data);
  
  // Format and isolate earnings
  const earnings = [];
  data.forEach(datum => {
    // Earnings: Remove commas and convert to integer
    datum.earnings_USD_2019 = +datum.earnings_USD_2019.replaceAll(',', '');
    earnings.push(datum.earnings_USD_2019);
  });
  // console.log('earnings', earnings);

  // createHistogram(earnings);
  createViolin(data);
});


// Create Histogram
const createHistogram = (earnings) => {

  // Generate Bins
  const bins = d3.bin().thresholds(17)(earnings);
  console.log('bins', bins);


  // Append svg parent
  const svg = d3.select('#viz')  
    .append('svg')
      .attr('width', width)
      .attr('height', height);


  // Create Scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([0, width - margin.left - margin.right])
    .nice();
  const yScale = d3.scaleLinear()
    .domain([0, bins[bins.length - 1].x1])
    .range([height - margin.bottom, margin.top]); // Vertical position is calculated Top to Bottom in the svg world
    

  // Append x-axis
  const xAxis = d3.axisBottom(xScale)
    .ticks(10);
  const xAxisGroup = svg
    .append('g')
      .attr('class', 'x-axis-group')
      .attr('transform', `translate(${margin.left},${height - margin.bottom})`)
      .style('font-size', '13px')
    .call(xAxis);

  // Append y-axis
  const yAxis = d3.axisLeft(yScale)
    .ticks(15)
    .tickSizeOuter(0);
  const yAxisGroup = svg
    .append('g')
      .attr('class', 'y-axis-group')
      .attr('transform', `translate(${margin.left}, 0)`)
      .style('font-size', '13px')
    .call(yAxis);
  yAxisGroup
    .append('text')
      .attr('text-anchor', 'start')
      .attr('x', 0 - margin.left) // Need to take into account the horizontal translation that was already applied to xAxisGroup
      .attr('y', 20)
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
      .attr('x', margin.left)
      .attr('y', d => yScale(d.x1) + padding)
      .attr('width', d => xScale(d.length)) // The svg width is the horizontal length of each rectangle, which is relative to the number of datapoints in each bin
      .attr('height', d => yScale(d.x0) - yScale(d.x1) - padding);


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
        return xScale(d[0]) + margin.left;
      } else {
        // Otherwise, the x position is relative to the length of the bin (the tip of the histogram bar)
        return xScale(d.length) + margin.left;
      }
    })
    .y((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        // If this is the first or the last element of the bins array, the second number (d[1]) represents the y position
        return yScale(d[1]);
      } else {
        // Otherwise, the y position is relative to the half-height of the histogram bar
        return yScale(d.x0) + (yScale(d.x1) - yScale(d.x0) - padding) / 2;
      }
    })
    .curve(d3.curveCatmullRom);

  svg
    .append('path')
      .attr('d', curveGenerator(bins))
      .attr('fill', 'none')
      .attr('stroke', 'magenta')
      .attr('stroke-width', 2);


  // Append area on histogram (density plot)

  const areaGenerator = d3.area()
    .x0(margin.left)
    .x1((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        return xScale(d[0]) + margin.left;
      } else {
        return xScale(d.length) + margin.left;
      }
    })
    .y((d, i) => {
      if (i === 0 || i === (bins.length - 1)) {
        return yScale(d[1]);
      } else {
        return yScale(d.x0) + (yScale(d.x1) - yScale(d.x0) - padding) / 2;
      }
    })
    .curve(d3.curveCatmullRom);
    
  svg
    .append('path')
      .attr('d', areaGenerator(bins))
      .attr('fill', 'yellow')
      .attr('fill-opacity', 0.4)
      .attr('stroke', 'none');

};

// Create the Split Violin Plot
const createViolin = (data) => {

  /***********************************/
  /*     Milestone 2 starts here     */
  /***********************************/
  
  // Create the bins for men
    // Isolate mens from the original dataset 
    const menData = data.filter(d => d.gender === 'men');
    // Create an array containing the men earnings only
    const menEarnings = menData.map(d => d.earnings_USD_2019);
    // Generate the bins - we want 17 bins with a 1M$ span
    const binsMen = d3.bin().thresholds(17)(menEarnings);
    console.log('binsMen', binsMen);

  // Create the bins for women
    // Isolate mens from the original dataset 
    const womenData = data.filter(d => d.gender === 'women');
    // Create an array containing the men earnings only
    const womenEarnings = womenData.map(d => d.earnings_USD_2019);
    // Generate the bins - we want 12 bins with a 1M$ span
    const binsWomen = d3.bin().thresholds(12)(womenEarnings);
    console.log('binsWomen', binsWomen);


  // Append svg parent
  const svg = d3.select('#viz')  
    .append('svg')
      .attr('width', width)
      .attr('height', height);


  // Create the Scales
    // The length of the largest bin. We first find the largest bin for Men and the largest for women. Then we use Math.max() to get the largest number between the two.
    const binsMaxLength = Math.max(d3.max(binsMen, d => d.length), d3.max(binsWomen, d => d.length));
    // The maximum width of on side of the violin plot
    const violinHalfWidth = 200;
    // The maximum earning covered by our bins. We already know that it is 17M$ but, for good measure, let's get it programmatically.
    const maxEarning = Math.max(binsMen[binsMen.length - 1].x1, binsWomen[binsWomen.length - 1].x1);
  
  const xScale = d3.scaleLinear()
    .domain([0, binsMaxLength])
    .range([0, violinHalfWidth]);
  const yScale = d3.scaleLinear()
    .domain([0, maxEarning])
    .range([height - margin.bottom, margin.top]);


  // Append x-axis
  // We won't need an axis with ticks here, so let's simply append a line
  const xAxis = svg
    .append('line')
      .attr('x1', margin.left)
      .attr('y1', height - margin.bottom)
      .attr('x2', width - margin.right)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#3B3B39');

  // Append y-axis
  const yAxis = d3.axisLeft(yScale)
    .ticks(15)
    .tickSizeOuter(0);
  const yAxisGroup = svg
    .append('g')
      .attr('class', 'y-axis-group')
      .attr('transform', `translate(${margin.left}, 0)`)
      .style('font-size', '13px')
    .call(yAxis);
  yAxisGroup
    .append('text')
      .attr('text-anchor', 'start')
      .attr('x', 0 - margin.left) // Need to take into account the horizontal translation that was already applied to xAxisGroup
      .attr('y', 20)
      .text('Earnings of the top tennis players in 2019 (USD)')
      .attr('fill', '#3B3B39')
      .style('font-size', '16px')
      .style('font-weight', 700);
  

  // Append the area (density plot) for men
    // Bonus: Expand the bins array to add points that meet the y-axis at the beginning and at the end
    binsMen.unshift([0, 0]);
    binsMen.push([0, binsMen[binsMen.length - 1].x1]);
    console.log('bins expanded', binsMen);

    // Declare the area generator
    const violinSymmetryAxisPosition = margin.left + (width - margin.right - margin.left) / 2;
    const areaGeneratorMen = d3.area()
      .x0(violinSymmetryAxisPosition)
      .x1((d, i) => {
        if (i === 0 || i === (binsMen.length - 1)) {
          return violinSymmetryAxisPosition + xScale(d[0]);
        } else {
          return violinSymmetryAxisPosition + xScale(d.length);
        }
      })
      .y((d, i) => {
        if (i === 0 || i === (binsMen.length - 1)) {
          return yScale(d[1]);
        } else {
          return yScale(d.x1) + ((yScale(d.x0) - yScale(d.x1)) / 2);
        }
      })
      .curve(d3.curveCatmullRom);

    // Append the area to the SVG parent
    const colorMen = '#F2C53D';
    svg
      .append('path')
        .attr('d', areaGeneratorMen(binsMen))
        .attr('fill', colorMen)
        .attr('fill-opacity', 0.8)
        .attr('stroke', 'none');
  

  // Append the area (density plot) for women
    // Bonus: Expand the bins array to add points that meet the y-axis at the beginning and at the end
    binsWomen.unshift([0, 0]);
    binsWomen.push([0, binsWomen[binsWomen.length - 1].x1]);
    console.log('bins expanded', binsWomen);

    // Declare the area generator
    const areaGeneratorWomen = d3.area()
      .x0((d, i) => {
        if (i === 0 || i === (binsWomen.length - 1)) {
          return violinSymmetryAxisPosition - xScale(d[0]);
        } else {
          return violinSymmetryAxisPosition - xScale(d.length);
        }
      })
      .x1(violinSymmetryAxisPosition)
      .y((d, i) => {
        if (i === 0 || i === (binsWomen.length - 1)) {
          return yScale(d[1]);
        } else {
          return yScale(d.x1) + ((yScale(d.x0) - yScale(d.x1)) / 2);
        }
      })
      .curve(d3.curveCatmullRom);

    // Append the area to the SVG parent
    const colorWomen = '#A6BF4B';
    svg
      .append('path')
        .attr('d', areaGeneratorWomen(binsWomen))
        .attr('fill', colorWomen)
        .attr('fill-opacity', 0.8)
        .attr('stroke', 'none');
  

  /***********************************/
  /*     Milestone 3 starts here     */
  /***********************************/

  // Set the simulation parameters
  const circlesRadius = 3;
  const circlesPadding = 1;
  const simulation = d3.forceSimulation(data)
    .force('forceX', d3.forceX(violinSymmetryAxisPosition).strength(0.1))
    .force('forceY', d3.forceY(d => yScale(d.earnings_USD_2019)).strength(10))
    .force('collide', d3.forceCollide(circlesRadius + circlesPadding))
    .force('axis', () => {
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
    .stop()
    .tick(300);

  // Check how D3's force simulation added positions and velocity to the data
  console.log(data);

  // Append circles
  const colorMenCircles = '#BF9B30';
  const colorWomenCircles = '#718233';
  const circlesGroup = svg
    .append('g')
      .attr('class', 'circles-group');
  circlesGroup
    .selectAll('circle')
    .data(data)
    .join('circle')
      .attr('class', 'player')
      .attr('cx', d => d.x) // the x parameter added to the data by the simulation
      .attr('cy', d => d.y) // the y parameter added to the data by the simulation
      .attr('r', circlesRadius)
      .style('fill', d => d.gender === 'women' ? colorWomenCircles : colorMenCircles)
      .style('fill-opacity', 0.6)
      .style('stroke', d => d.gender === 'women' ? colorWomenCircles : colorMenCircles);



  /***********************************/
  /*     Milestone 3 starts here     */
  /***********************************/

  // Set the simulation parameters
  const circlesRadius = 3;
  const circlesPadding = 1;
  const simulation = d3.forceSimulation(data)
    .force('forceX', d3.forceX( ... ).strength( ... ))
    .force('forceY', d3.forceY(d =>  ... ).strength( ... ))
    .force('collide', d3.forceCollide( ... ))
    .force('axis', () => {
      data.forEach(d => {
        
        // If man and the circle's x position is on the left side of the violin
        if ( ... ) {
          // Increase velocity toward the right
          d.vx +=  ... ;
        }

        // If woman and the circle's x position is on the right side of the violin
        if ( ... ) {
          // Increase velocity toward the left
          d.vx -=  ... ;
        }
      })
    })
    .stop()
    .tick(300);

  // Check how D3's force simulation added positions and velocity to the data
  console.log(data);

  // Append circles
  const colorMenCircles = '#BF9B30';
  const colorWomenCircles = '#718233';
  const circlesGroup = svg
    .append('g')
      .attr('class', 'circles-group');
  circlesGroup
    .selectAll( ... )
    .data( ... )
    .join( ... )
      .attr('class', 'player')
      .attr('cx', d =>  ... ) // the x parameter added to the data by the simulation
      .attr('cy', d =>  ... ) // the y parameter added to the data by the simulation
      .attr('r',  ... )
      .style('fill', d =>  ... )
      .style('fill-opacity', 0.6)
      .style('stroke', d =>  ... );
};

