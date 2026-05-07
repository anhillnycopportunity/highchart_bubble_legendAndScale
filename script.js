async function loadBubbleSeries() {
  const response = await fetch("data.csv");
  const text = await response.text();
  return csvTextToBubbleSeries(text);
}

function csvTextToBubbleSeries(csvText) {
  const lines = csvText
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Remove header row
  const [header, ...dataRows] = lines;

  // Parse header to find column indices (case-insensitive)
  const cols = header.split(',').map(h => h.trim().toLowerCase());
  const idx = {
    name:       cols.indexOf('name'),
    x:          cols.indexOf('x'),
    y:          cols.indexOf('y'),
    z:          cols.indexOf('z'),
    colorValue: cols.indexOf('colorvalue'),
  };

 // Validate all required columns exist
  const missing = Object.entries(idx)
    .filter(([, i]) => i === -1)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`CSV is missing required columns: ${missing.join(', ')}`);
  }

 // Build one series per row
  const series = dataRows.map(row => {
    const cells = row.split(',').map(c => c.trim());

    return {
      type: 'bubble',
      name: cells[idx.name],
      data: [{
        x:          parseFloat(cells[idx.x]),
        y:          parseFloat(cells[idx.y]),
        z:          parseFloat(cells[idx.z]),
        colorValue: parseFloat(cells[idx.colorValue]),
      }]
    };
  });

  return series;
}

 
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
        text: 'Source: Census Bureaus American Community Survey One-Year Public Use Micorodata'
    },


    legend: {
        enabled: true
    },

     xAxis: {
        gridLineWidth: 1,
        title: {
            text: 'Ratio of Part-Time to Full-Time Workers'
        },
        labels: {
            format: '{value}'
        },
        plotLines: [{
            dashStyle: 'dot',
            width: 2,
            value: .5,
            label: {
                rotation: 0,
                y: 50,
                style: {
                    fontStyle: 'italic'
                },
                text: 'Ratio Part-time Full-time'
            },
            zIndex: 3
        }]
    },

    yAxis: {
        startOnTick: false,
        endOnTick: false,
        title: {
            text: 'Percent Industry Median to Citywide Median Wage'
        },
        labels: {
            format: '{value}%'
        },
        maxPadding: .1,
        plotLines: [{
            dashStyle: 'dot',
            width: 2,
            value: 1,
            label: {
                align: 'right',
                style: {
                    fontStyle: 'italic'
                },
                text: 'Equal to Citywide Median Wage',
                x: 0.5
            },
            zIndex: 3
        }]
    },

    tooltip: {
      useHTML: true,
      pointFormat:
        "<b>{series.name}</b><br/>" +
        "x: {point.x}<br/>" +
        "y: {point.y}<br/>" +
        "z: {point.z}"
    },

    colorAxis: {
      min: -0.3,               // low end of your z/color range
      max: 0.3,             // high end

      // Built-in named stops
      stops: [
        [-0.3,   '#3060cf'],   // 0%  → blue
        [0, '#fffbbc'],   // 50% → yellow
        [0.3,   '#c4463a']    // 100% → red
      ],

      showInLegend: true,   // keeps colorbar in legend area

      // colorbar (the visual legend for the scale)
      labels: { format: '{value}%' }
},

    legend: {
  enabled: true,
  layout: 'vertical',
  align: 'right',
  verticalAlign: 'middle',

  // colorbar sits above dot labels in the legend
  // Highcharts stacks them automatically
},

    series: [{
      series,
  showInLegend: true
  //marker: { symbol: 'circle' },  // consistent dot shape in legend
}]
    //series: series
  });
}

drawChart();
