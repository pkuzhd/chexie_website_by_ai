import axios from 'axios';
import config from '../config';

const API_HOST = config.API_HOST;

export const userService = {
  getUserInfo: async (username) => {
    const response = await axios.get(`${API_HOST}/api/userinfo/${encodeURIComponent(username)}`);
    return response.data.data?.[username] || null;
  },

  getRecentPosts: async (username, limit = 10) => {
    const response = await axios.get(`${API_HOST}/api/threads/user/${encodeURIComponent(username)}`, {
      params: { limit }
    });
    return response.data.data || [];
  },

  getRecentReplies: async (username, limit = 10) => {
    const response = await axios.get(`${API_HOST}/api/posts/user/${encodeURIComponent(username)}`, {
      params: { limit }
    });
    return response.data.data || [];
  },
};
