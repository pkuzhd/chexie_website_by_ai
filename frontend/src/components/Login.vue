<template>
  <div class="login-container">
    <div class="login-form">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import authService from '../services/authService';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);
const error = ref('');
const form = reactive({
  username: '',
  password: ''
});

const handleLogin = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    const response = await authService.login(form.username, form.password);
    
    // 保存token和用户信息到本地存储
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // 登录成功后跳转到首页或用户页面
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || '登录失败，请检查用户名和密码';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #242424;
  padding: 1rem;
}

.login-form {
  background: #333;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #fff;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #ddd;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #444;
  color: #fff;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.form-group input::placeholder {
  color: #888;
}

.form-actions {
  margin-top: 1.5rem;
}

.form-actions button {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-actions button:hover:not(:disabled) {
  background-color: #35495e;
}

.form-actions button:disabled {
  background-color: #a0c8b0;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  color: #ff4444;
  text-align: center;
  font-size: 0.9rem;
}
</style>