import Chart from 'chart.js';
import axios from 'axios';
import csvParse from 'csv-parse/lib/sync';
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
            max: 40,
            stepSize: 5,
          },
        }],
      },
    },
  }));
}

async function main() {
  const tokyoCovidDataCsv = await asyncGet('data/130001_tokyo_covid19_patients.csv');
  const tokyoCovidData = csvParse(tokyoCovidDataCsv, { columns: true, trim: true });

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
  for (let date = startDateObj; date <= endDateObj; date.setDate(date.getDate() + 1)) {
    const year = String(date.getFullYear());
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    dateArray.push(`${year}-${month}-${day}`);
  }

  const age = ['10歳未満', '10代', '20代', '30代', '40代', '50代', '60代', '70代', '80代', '90代', '不明'];
  const totalDataObj = {};

  dateArray.forEach((val) => {
    totalDataObj[val] = { age: {} };
    age.forEach((ele) => {
      totalDataObj[val].age[ele] = {
        total: 0, man: 0, woman: 0, unknown: 0,
      };
    });
  });

  tokyoCovidData.forEach((val) => {
    const ageName = (val['患者_年代'] === '不明' || val['患者_年代'] === '調査中') ? '不明' : val['患者_年代'];
    totalDataObj[val['公表_年月日']].age[ageName].total += 1;
    switch (val['患者_性別']) {
      case '男性':
        totalDataObj[val['公表_年月日']].age[ageName].man += 1;
        break;
      case '女性':
        totalDataObj[val['公表_年月日']].age[ageName].woman += 1;
        break;
      default:
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
  const dataAgeDay = {};
  const dataColor = {};

  age.forEach((val) => {
    dataAgeDay[val] = [];
    dataColor[val] = getRandomColor();
  });

  totalData.forEach((val) => {
    const labelDate = val.date.split('-');
    labels.push(`${Number(labelDate[1])}/${Number(labelDate[2])}/${labelDate[0].slice(-2)}`);
    age.forEach((ageName) => {
      dataAgeDay[ageName].push(val.age[ageName].total);
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
