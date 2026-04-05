import axios from 'axios';
import config from '../config';

const API_HOST = config.API_HOST;

export const threadService = {
  getThreads: async (params) => {
    const response = await axios.get(`${API_HOST}/api/threads`, {
      params: {
        bid: params.bid,
        p: params.page,
        extr: params.extr,
        p_size: 25,
        sort_by: params.sortBy
      }
    });
    return response.data.data?.threads || [];
  }
};
