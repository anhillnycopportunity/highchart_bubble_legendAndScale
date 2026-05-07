
async function loadBubbleSeries() {
  const response = await fetch("data.csv");
  const text = await response.text();
  return csvTextToBubbleSeries(text);
}

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

  // ✅ Single series — all points together so colorAxis applies
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

async function drawChart() {
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
    colorAxis: {
      min: -0.3,
      max: 0.3,
      stops: [
        [0,   '#3060cf'],
        [0.5, '#fffbbc'],
        [1,   '#c4463a']
      ],
      labels: { format: '{value}' },
      // ✅ This renders the gradient color scale bar in the legend area
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle'
    },
    tooltip: {
      useHTML: true,
      // ✅ point.name works because each point has a name property
      pointFormat:
        "<b>{point.name}</b><br/>" +
        "Part-time ratio: {point.x}<br/>" +
        "Wage ratio: {point.y}%<br/>" +
        "Employment (z): {point.z}<br/>" +
        "Color value: {point.colorValue}"
    },
    legend: {
      enabled: true,
    },
    series: series
  });
}

drawChart();
