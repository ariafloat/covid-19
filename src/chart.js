import Chart from 'chart.js';
import axios from 'axios';
import getRandomColor from './color';

async function asyncGet(url) {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

function generateChart(index, labels, datasets) {
  const ctx = document.getElementById(`ageChart${index}`).getContext('2d');
  const charts = [];
  charts.push(new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      legend: {
        position: 'top',
      },
      tooltips: {
        mode: 'index',
        intersect: true,
      },
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 30,
            stepSize: 5,
          },
        }],
      },
    },
  }));
}

async function main() {
  const response = await asyncGet('data/tokyo.json');
  const { data } = response;

  const labels = [];
  const age = ['10代未満', '10代', '20代', '30代', '40代', '50代', '60代', '70代', '80代', '90代', '不明'];
  const dataAgeDay = {};
  const dataColor = {};

  age.forEach((val) => {
    dataAgeDay[val] = [];
    dataColor[val] = getRandomColor();
  });

  data.forEach((val) => {
    labels.push(val['日付']);
    age.forEach((ageName) => {
      dataAgeDay[ageName].push(val[ageName]);
    });
  });

  const { color } = Chart.helpers;
  const datasets = [];

  age.forEach((val) => {
    dataColor[val] = getRandomColor();
    datasets.push({
      label: val,
      backgroundColor: color(dataColor[val]).alpha(0.5).rgbString(),
      borderColor: color(dataColor[val]).alpha(1).rgbString(),
      borderWidth: 1,
      data: dataAgeDay[val],
    });
  });

  datasets.forEach((val, index) => {
    generateChart(index + 1, labels, [val]);
  });
}

main();
