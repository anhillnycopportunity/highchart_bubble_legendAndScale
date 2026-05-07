async function loadCSV() {
  const response = await fetch("test_data.csv");
  const text = await response.text();

  const rows = text.trim().split("\n");
  rows.shift(); // remove header

  return rows.map(row => {
    const cols = row.split(",");

    return {
      series: cols[0],
      x: parseFloat(cols[1]),
      y: parseFloat(cols[2]),
      z: parseFloat(cols[3]),
      color: cols[4]
    };
  });
}

async function drawChart() {
  const rawData = await loadCSV();

  const series = rawData.map(d => {
    const cleanColor = d.color
      .replace(/\r/g, "")
      .replace(/"/g, "")
      .trim();

    return {
      name: d.series, // this becomes legend label
      data: [{
        x: d.x,
        y: d.y,
        z: d.z
      }],
      color: cleanColor
    };
  });

  
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

    series: series
  });
}

drawChart();
