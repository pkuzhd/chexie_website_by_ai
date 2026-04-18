import { inject } from 'vue';
import authService from '../services/authService';

export function useAuth() {
  const currentUser = inject('currentUser');

  const getCurrentUser = async () => {
    try {
      const data = await authService.getCurrentUser();

      if (data.username && currentUser) {
        currentUser.value = {
          username: data.username,
          rights: data.rights || 0,
          icon: data.icon,
          score: data.score || 0,
          star: data.star || 0,
          newmsg: data.newmsg || 0,
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
      await authService.logout();

      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
      localStorage.removeItem('token');

      if (currentUser) currentUser.value = null;
    } catch (err) {
      console.error('注销失败:', err);
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
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
