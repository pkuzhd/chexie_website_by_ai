<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/">论坛</router-link>
      </div>
      
      <div class="navbar-menu">
        <div class="navbar-links">
          <router-link to="/" class="navbar-link">首页</router-link>
          <router-link to="/posts" class="navbar-link">帖子</router-link>
        </div>
        
        <div class="navbar-user">
          <!-- 如果已登录显示用户信息和登出按钮 -->
          <template v-if="currentUser">
            <div class="user-info">
              <span class="username">{{ currentUser.username }}</span>
              <button @click="handleLogout" class="logout-btn">登出</button>
            </div>
          </template>
          
          <!-- 如果未登录显示登录按钮 -->
          <template v-else>
            <router-link to="/login" class="login-btn">登录</router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';

const router = useRouter();
const currentUser = ref(null);

const checkLoginStatus = async () => {
  try {
    const data = await authService.getCurrentUser();
    if (data.username) {
      currentUser.value = { username: data.username };
    } else {
      currentUser.value = null;
    }
  } catch (error) {
    currentUser.value = null;
  }
};

const handleLogout = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('登出失败:', error);
  } finally {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
    localStorage.removeItem('token');
    currentUser.value = null;
    router.push('/bbs/login');
  }
};

onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped>
.navbar {
  background-color: #35495e;
  color: white;
  padding: 0.5rem 0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-brand a {
  color: white;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
}

.navbar-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.navbar-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-weight: 500;
}

.logout-btn, .login-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.logout-btn {
  background-color: #ff4444;
  color: white;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #cc0000;
}

.login-btn {
  background-color: #42b883;
  color: white;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background-color: #35495e;
}
</style>