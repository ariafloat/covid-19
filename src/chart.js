import Chart from 'chart.js';
import axios from 'axios';
import csvParse from 'csv-parse/lib/sync';
import getRandomColor from './color';

const age = ['10歳未満', '10代', '20代', '30代', '40代', '50代', '60代', '70代', '80代', '90代', '不明'];

function generateAgeSexChart(index, labels, datasets, max) {
  const ctx = document.getElementById(`ageSexChart${index + 1}`).getContext('2d');
  const charts = [];
  charts.push(new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: age[index],
      },
      legend: {
        position: 'top',
      },
      tooltips: {
        mode: 'index',
      },
      scales: {
        xAxes: [{
          stacked: true,
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            min: 0,
            max,
            stepSize: 5,
          },
        }],
      },
    },
  }));
}

function pieChart(id, title, labels, datasets) {
  const ctx = document.getElementById(id).getContext('2d');
  const charts = [];
  charts.push(new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: title,
      },
      legend: {
        position: 'top',
      },

    },
  }));
}

async function main() {
  const tokyoCovidDataCsv = await axios.get('data/130001_tokyo_covid19_patients.csv');
  const tokyoCovidData = csvParse(tokyoCovidDataCsv.data, { columns: true, trim: true });

  const dateExtract = [];
  tokyoCovidData.forEach((val) => {
    const foundIndex = dateExtract.findIndex((ele) => ele === val['公表_年月日']);
    if (foundIndex === -1) {
      dateExtract.push(val['公表_年月日']);
    }
  });

  const startDate = dateExtract[0].split('-');
  const startDateObj = new Date(Number(startDate[0]), Number(startDate[1]) - 1, Number(startDate[2]));
  const endDate = dateExtract[dateExtract.length - 1].split('-');
  const endDateObj = new Date(Number(endDate[0]), Number(endDate[1]) - 1, Number(endDate[2]));
  const dateArray = [];

  document.getElementById('totalPositive').innerHTML = tokyoCovidData.length.toLocaleString();
  document.getElementById('present').innerHTML = `${endDate[0]}/${endDate[1]}/${endDate[2]} 時点`;

  for (let date = startDateObj; date <= endDateObj; date.setDate(date.getDate() + 1)) {
    const year = String(date.getFullYear());
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    dateArray.push(`${year}-${month}-${day}`);
  }

  const totalDataObj = {};
  const totalSexDataObj = { man: 0, woman: 0, unknown: 0 };
  dateArray.forEach((val) => {
    totalDataObj[val] = { age: {} };
    age.forEach((ele) => {
      totalDataObj[val].age[ele] = {
        total: 0, man: 0, woman: 0, unknown: 0,
      };
    });
  });

  const totalAgeDataObj = {};
  age.forEach((val) => {
    totalAgeDataObj[val] = 0;
  });

  tokyoCovidData.forEach((val) => {
    const ageName = (val['患者_年代'] === '不明' || val['患者_年代'] === '調査中') ? '不明' : val['患者_年代'];
    totalAgeDataObj[ageName] += 1;
    totalDataObj[val['公表_年月日']].age[ageName].total += 1;
    switch (val['患者_性別']) {
      case '男性':
        totalSexDataObj.man += 1;
        totalDataObj[val['公表_年月日']].age[ageName].man += 1;
        break;
      case '男':
        totalSexDataObj.man += 1;
        totalDataObj[val['公表_年月日']].age[ageName].man += 1;
        break;
      case '女性':
        totalSexDataObj.woman += 1;
        totalDataObj[val['公表_年月日']].age[ageName].woman += 1;
        break;
      case '女':
        totalSexDataObj.woman += 1;
        totalDataObj[val['公表_年月日']].age[ageName].woman += 1;
        break;
      default:
        totalSexDataObj.unknown += 1;
        totalDataObj[val['公表_年月日']].age[ageName].unknown += 1;
    }
  });

  const totalData = [];
  Object.keys(totalDataObj).forEach((key) => {
    totalData.push({ date: key, age: totalDataObj[key].age });
  });

  totalData.sort((a, b) => {
    if (a.date > b.date) return 1;
    return -1;
  });

  const labels = [];
  const dataAgeSexDay = {};
  let dataAgeSexDayMax = 0;
  const dataColor = {};

  age.forEach((val) => {
    dataAgeSexDay[val] = { man: [], woman: [], unknown: [] };
    dataColor[val] = getRandomColor();
  });

  totalData.forEach((val) => {
    const labelDate = val.date.split('-');
    labels.push(`${Number(labelDate[1])}/${Number(labelDate[2])}/${labelDate[0].slice(-2)}`);
    age.forEach((ageName) => {
      dataAgeSexDay[ageName].man.push(val.age[ageName].man);
      dataAgeSexDay[ageName].woman.push(val.age[ageName].woman);
      dataAgeSexDay[ageName].unknown.push(val.age[ageName].unknown);
      if (val.age[ageName].total > dataAgeSexDayMax) {
        dataAgeSexDayMax = val.age[ageName].total;
      }
    });
  });

  const { color } = Chart.helpers;
  const chartColor = {
    red: 'rgba(255, 99, 132)',
    blue: 'rgba(54, 162, 235)',
    grey: 'rgb(201, 203, 207)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    purple: 'rgb(153, 102, 255)',
    brown: 'rgb(139, 69, 19)',
    blueGreen: 'rgb(51, 204, 204)',
    indigo: 'rgb(63, 81, 181)',
    blueGrey: 'rgb(38, 49, 55)',
  };

  const dataSexChart = [{
    backgroundColor: [
      color(chartColor.blue).alpha(1).rgbString(),
      color(chartColor.red).alpha(1).rgbString(),
      color(chartColor.grey).alpha(1).rgbString(),
    ],
    data: [totalSexDataObj.man, totalSexDataObj.woman, totalSexDataObj.unknown],
  }];
  document.getElementById('sexChartManCnt').innerHTML = totalSexDataObj.man.toLocaleString();
  document.getElementById('sexChartWomanCnt').innerHTML = totalSexDataObj.woman.toLocaleString();
  document.getElementById('sexChartUnknownCnt').innerHTML = totalSexDataObj.unknown.toLocaleString();
  pieChart('sexChart', '性別', ['男性', '女性', '不明'], dataSexChart);

  const ageChartColor = ['blue', 'red', 'orange', 'yellow', 'green', 'blueGreen', 'indigo', 'purple', 'brown', 'blueGrey', 'grey'];
  const dataAgeChart = [{
    backgroundColor: ageChartColor.map((val) => color(chartColor[val]).alpha(1).rgbString()),
    data: age.map((val) => totalAgeDataObj[val]),
  }];
  dataAgeChart[0].data.forEach((val, index) => {
    document.getElementById(`ageChartCnt${index + 1}`).innerHTML = val.toLocaleString();
  });
  pieChart('ageChart', '年代別', age, dataAgeChart);

  const dataAgeSexChart = [];

  age.forEach((val) => {
    dataAgeSexChart.push([
      {
        label: '男性',
        backgroundColor: color(chartColor.blue).alpha(0.5).rgbString(),
        borderColor: color(chartColor.blue).alpha(1).rgbString(),
        borderWidth: 1,
        data: dataAgeSexDay[val].man,
        fill: false,
      },
      {
        label: '女性',
        backgroundColor: color(chartColor.red).alpha(0.5).rgbString(),
        borderColor: color(chartColor.red).alpha(1).rgbString(),
        borderWidth: 1,
        data: dataAgeSexDay[val].woman,
        fill: false,
      },
      {
        label: '不明',
        backgroundColor: color(chartColor.grey).alpha(0.5).rgbString(),
        borderColor: color(chartColor.grey).alpha(1).rgbString(),
        borderWidth: 1,
        data: dataAgeSexDay[val].unknown,
        fill: false,
      },
    ]);
  });

  const ageSexDayChartMax = Math.ceil(dataAgeSexDayMax / 10) * 10;

  dataAgeSexChart.forEach((val, index) => {
    generateAgeSexChart(index, labels, val, ageSexDayChartMax);
  });
}

main();
