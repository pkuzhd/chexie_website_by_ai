import { inject } from 'vue';
import axios from 'axios';
import config from '../config';
import { useCookie } from './useCookie';

export function useAuth() {
  const API_HOST = config.API_HOST;
  const { getCookie } = useCookie();
  const currentUser = inject('currentUser');

  const getCurrentUser = async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        if (currentUser) currentUser.value = null;
        return;
      }
      
      const response = await axios.get(`${API_HOST}/api/auth_legacy/current`, {
        withCredentials: true
      });
      
      if (response.data.username && currentUser) {
        currentUser.value = {
          username: response.data.username,
          rights: response.data.rights || 0,
          icon: response.data.icon,
          score: response.data.score || 0,
          star: response.data.star || 0,
          newmsg: response.data.newmsg || 0,
        };
      } else if (currentUser) {
        currentUser.value = null;
      }
    } catch (err) {
      console.error('获取当前用户信息失败:', err);
      if (currentUser) currentUser.value = null;
    }
  };

  const handleLogout = async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        if (currentUser) currentUser.value = null;
        return;
      }
      
      await axios.post(`${API_HOST}/api/auth_legacy/logout`, {
        token
      }, {
        withCredentials: true
      });
      
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('token');
      
      if (currentUser) currentUser.value = null;
    } catch (err) {
      console.error('注销失败:', err);
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('token');
      if (currentUser) currentUser.value = null;
    }
  };

  return {
    currentUser,
    getCurrentUser,
    handleLogout
  };
}
