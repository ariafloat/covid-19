import comm from './comm';

async function main() {
  const resCelebrity = await comm.get('data/celebrity.json');
  const celebrityList = resCelebrity.data;

  let passAwayTotal = 0;
  let dom = '';
  celebrityList.forEach((val) => {
    const infectionConfirmDate = val.infectionConfirmDate.split('/');
    const birthday = val.birthday.split('/');
    let { name } = val;
    if (val.passAway) {
      passAwayTotal += 1;
      name = `${val.name}<br>（他界）`;
    }
    const td1 = `<td class="align-middle">${name}</td>`;
    const td2 = `<td class="align-middle">${val.occupation}</td>`;
    const td3 = `<td class="align-middle">${Number(infectionConfirmDate[0])}/${Number(infectionConfirmDate[1])}/${Number(infectionConfirmDate[2])}</td>`;
    const td4 = `<td class="align-middle">${Number(birthday[0])}/${Number(birthday[1])}/${Number(birthday[2])}</td>`;
    dom += `<tr>${td1}${td2}${td3}${td4}</tr>`;
  });
  document.getElementById('celebrityTotal').innerHTML = celebrityList.length.toLocaleString();
  document.getElementById('celebrityPassAwayTotal').innerHTML = passAwayTotal;
  document.getElementById('celebrityList').innerHTML = dom;
}

main();
