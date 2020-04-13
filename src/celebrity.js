import comm from './comm';

async function main() {
  const resCelebrity = await comm.get('data/celebrity.json');
  const celebrityList = resCelebrity.data;

  let dom = '';
  celebrityList.forEach((val) => {
    const infectionConfirmDate = val.infectionConfirmDate.split('/');
    const birthday = val.birthday.split('/');
    const td1 = `<td>${val.name}</td>`;
    const td2 = `<td>${val.occupation}</td>`;
    const td3 = `<td>${Number(infectionConfirmDate[0])}/${Number(infectionConfirmDate[1])}/${Number(infectionConfirmDate[2])}</td>`;
    const td4 = `<td>${Number(birthday[0])}/${Number(birthday[1])}/${Number(birthday[2])}</td>`;
    dom += `<tr>${td1}${td2}${td3}${td4}</tr>`;
  });
  document.getElementById('celebrityTotal').innerHTML = celebrityList.length.toLocaleString();
  document.getElementById('celebrityList').innerHTML = dom;
}

main();
