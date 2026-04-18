import axios from 'axios';
import config from '../config';

const API_HOST = config.API_HOST;

export default {
  login(username, password, options = {}) {
    const { md5, onlinetype, browser, system } = options;
    return axios.post(`${API_HOST}/api/auth_legacy/login`, {
      username,
      password,
      md5,
      onlinetype: onlinetype || 'web',
      browser: browser || navigator.userAgent,
      system
    }, {
      withCredentials: true
    });
  },

  logout() {
    return axios.post(`${API_HOST}/api/auth_legacy/logout`, {}, {
      withCredentials: true
    });
  },

  async getCurrentUser() {
    const response = await axios.get(`${API_HOST}/api/auth_legacy/current`, {
      withCredentials: true
    });
    return response.data;
  },

  async verifyToken() {
    try {
      const data = await this.getCurrentUser();
      return !!(data && data.username);
    } catch (error) {
      return false;
    }
  }
};
