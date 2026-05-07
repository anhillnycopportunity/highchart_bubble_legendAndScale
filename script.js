async function loadBubbleSeries() {
  const response = await fetch("data.csv");
  const text = await response.text();
  return csvTextToBubbleSeries(text);
}

function csvTextToBubbleSeries(csvText) {
  const lines = csvText.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const [header, ...dataRows] = lines;
  const cols = header.split(',').map(h => h.trim().toLowerCase());
  const idx = {
    name:       cols.indexOf('name'),
    x:          cols.indexOf('x'),
    y:          cols.indexOf('y'),
    z:          cols.indexOf('z'),
    colorValue: cols.indexOf('colorvalue'),
  };

  const missing = Object.entries(idx).filter(([,i]) => i === -1).map(([k]) => k);
  if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}`);

  // Single series, all points inside .data[]
  return [{
    type: 'bubble',
    name: 'Industries',
    colorKey: 'colorValue',   // tells Highcharts which field drives colorAxis
    data: dataRows.map(row => {
      const cells = row.split(',').map(c => c.trim());
      return {
        name:       cells[idx.name],
        x:          parseFloat(cells[idx.x]),
        y:          parseFloat(cells[idx.y]),
        z:          parseFloat(cells[idx.z]),
        colorValue: parseFloat(cells[idx.colorValue]),
      };
    })
  }];
}


// drawChart as an async function
async function drawChart() {
  // await the series data before building the chart
  const series = await loadBubbleSeries();

  Highcharts.chart("container", {
    chart: {
      type: 'bubble',
      plotBorderWidth: 1,
      zoomType: "xy"
    },
    
    title: {
      text: "Job Characteristics by Industry in New York City, 2024"
    },
    
    subtitle: {
      text: 'Source: Census Bureau\'s American Community Survey One-Year Public Use Microdata'
    },
    
    xAxis: {
      gridLineWidth: 1,
      title: { text: 'Ratio of Part-Time to Full-Time Workers' },
      labels: { format: '{value}' },
      plotLines: [{
        dashStyle: 'dot',
        width: 2,
        value: 0.5,
        label: {
          rotation: 0,
          y: 50,
          style: { fontStyle: 'italic' },
          text: 'Ratio Part-time Full-time'
        },
        zIndex: 3
      }]
    },
    
    yAxis: {
      startOnTick: false,
      endOnTick: false,
      title: { text: 'Percent Industry Median to Citywide Median Wage' },
      labels: { format: '{value}%' },
      maxPadding: 0.1,
      plotLines: [{
        dashStyle: 'dot',
        width: 2,
        value: 1,
        label: {
          align: 'right',
          style: { fontStyle: 'italic' },
          text: 'Equal to Citywide Median Wage',
          x: 0.5
        },
        zIndex: 3
      }]
    },
    
    tooltip: {
  useHTML: true,
  // Use point.name instead of series.name (since all points share one series now)
  pointFormat:
    "<b>{point.name}</b><br/>" +
    "x: {point.x}<br/>" +
    "y: {point.y}<br/>" +
    "z: {point.z}<br/>" +
    "color value: {point.colorValue}"
},
    
    colorAxis: {
  min: -0.3,
  max: 0.3,
  stops: [
    [0,   '#3060cf'],
    [0.5, '#fffbbc'],
    [1,   '#c4463a']
  ],
  labels: { format: '{value}' }  // drop % if colorValue isn't a percentage
},
    
    legend: {
  enabled: true,
  // The colorAxis scale will render as a gradient legend bar automatically
  // If you also want per-point labels, use the point.name in the data labels below
},

    plotOptions: {
  bubble: {
    // Show industry name as a label on each bubble
    dataLabels: {
      enabled: true,
      format: '{point.name}',
      style: { textOutline: 'none' }
    }
  }
},
    
    
    // spread series directly, not nested in an object
    series: series
  });
}

drawChart();
