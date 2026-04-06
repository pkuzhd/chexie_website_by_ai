import axios from 'axios';
import config from '../config';

const API_HOST = config.API_HOST;

export const boardService = {
  getAllBoards: async () => {
    const response = await axios.get(`${API_HOST}/api/boardinfo`);
    return response.data.data || [];
  },

  getBoardInfo: async (bid) => {
    const response = await axios.get(`${API_HOST}/api/boardinfo/${bid}`);
    return response.data.data;
  },

  getHotThreads: async (params) => {
    const response = await axios.get(`${API_HOST}/api/threads/hot`, { params });
    return response.data.data || [];
  },

  getGlobalTopThreads: async (params) => {
    const response = await axios.get(`${API_HOST}/api/threads/global_top`, { params });
    return response.data.data || [];
  },
};
