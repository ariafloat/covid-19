import axios from 'axios';

const get = async function asyncGet(url) {
  try {
    const res = await axios.get(url);
    // const res = await axios.get(`${url}?timestamp=${new Date().getTime()}`);
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default { get };
