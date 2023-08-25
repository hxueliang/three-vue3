import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:4523/m1/3204882-0-default';

export function getSmartCityInfo() {
  return axios.get(`${BASE_URL}/api/smartcity/info`);
}
