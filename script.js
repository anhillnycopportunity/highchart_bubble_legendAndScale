// interpolate color
function interpolateColor(stops, value, min, max) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  
  // Find which stop pair we're between
  let lower = stops[0], upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }
  
  // Normalize t within this stop segment
  const segT = (t - lower[0]) / (upper[0] - lower[0]) || 0;
  
  // Parse hex colors and interpolate RGB
  const parse = hex => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
  const [r1, g1, b1] = parse(lower[1]);
  const [r2, g2, b2] = parse(upper[1]);
  
  const r = Math.round(r1 + (r2 - r1) * segT);
  const g = Math.round(g1 + (g2 - g1) * segT);
  const b = Math.round(b1 + (b2 - b1) * segT);
  return `rgb(${r},${g},${b})`;
}

// get data
async function loadBubbleSeries() {
  const response = await fetch("data.csv");
  const text = await response.text();
  return csvTextToBubbleSeries(text);
}

// structure data
function csvTextToBubbleSeries(csvText) {
  const lines = csvText.trim().split('\n')
    .map(l => l.trim()).filter(l => l.length > 0);
  const [header, ...dataRows] = lines;
  const cols = header.split(',').map(h => h.trim().toLowerCase());
  const idx = {
    name:       cols.indexOf('name'),
    x:          cols.indexOf('x'),
    y:          cols.indexOf('y'),
    z:          cols.indexOf('z'),
    colorValue: cols.indexOf('colorvalue'),
  };

  // Single series — all points together so colorAxis applies
  return [{
    type: 'bubble',
    name: 'Industries',
    colorKey: 'colorValue',      // ← key line: maps colorValue → colorAxis
    showInLegend: false,         // the colorAxis acts as the legend for color
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

// build legend
function buildLegend(points, stops, min, max) {
  const legend = document.getElementById('custom-legend');
  legend.innerHTML = ''; // clear if redrawing

  points.forEach(point => {
    const color = interpolateColor(stops, point.colorValue, min, max);

    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-dot" style="background:${color}"></span>
      <span class="legend-label">${point.name}</span>
    `;
    legend.appendChild(item);
  });
}

// config colors for scale/legend  
// original center yellow #fffbbc
const COLOR_STOPS = [
  [0,   '#3060cf'],
  [0.5, '#776966'],
  [1,   '#c4463a']
];
const COLOR_MIN = -0.3;
const COLOR_MAX =  0.3;



// DRAW CHART
async function drawChart() {
  const series = await loadBubbleSeries();
  const points = series[0].data;   // all your point objects


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
      text: "Source: Census Bureau's American Community Survey One-Year PUMS"
    },
    xAxis: {
      gridLineWidth: 1,
      title: { text: 'Ratio of Part-Time to Full-Time Workers' },
      plotLines: [{
        dashStyle: 'dot', width: 2, value: 0.5,
        label: { rotation: 0, y: 50, style: { fontStyle: 'italic' },
                 text: 'Ratio Part-time Full-time' },
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
        dashStyle: 'dot', width: 2, value: 1,
        label: { align: 'right', style: { fontStyle: 'italic' },
                 text: 'Equal to Citywide Median Wage', x: 0.5 },
        zIndex: 3
      }]
    },
    
    tooltip: {
      useHTML: true,
      // point.name works because each point has a name property
      pointFormat:
        "<b>{point.name}</b><br/>" +
        "Part-time ratio: {point.x}<br/>" +
        "Wage ratio: {point.y}%<br/>" +
        "Employment (z): {point.z}<br/>" +
        "Color value: {point.colorValue}"
    },

colorAxis: {
  min: COLOR_MIN,
  max: COLOR_MAX,
  stops: COLOR_STOPS,
  showInLegend: true,
  labels: {
    format: '{value}'
  },
  title: {
            text: 'Racial Representation Ratio'
        }
},


    legend: { enabled: true },  
    series: series
  });
  // Build the custom HTML legend from the same data
  buildLegend(points, COLOR_STOPS, COLOR_MIN, COLOR_MAX);
}

drawChart();
