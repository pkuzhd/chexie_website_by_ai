<template>
  <div class="login-page">
    <div class="main">
      <div>
        <h1>登录CAPUBBS</h1>
        <form @submit.prevent="handleLogin">
          用户名：<input
            ref="usernameInput"
            v-model="form.username"
            name="username"
            type="text"
            class="text"
            @keypress.enter="$refs.passwordInput.focus()"
          ><br>
          　密码：<input
            ref="passwordInput"
            v-model="form.password"
            name="password"
            type="password"
            class="text"
            @keypress.enter="handleLogin"
          ><br>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <input type="button" value="登录" class="button" :disabled="isLoading" @click="handleLogin">
          <span>&nbsp;</span>
          <input type="button" value="注册" class="button" @click="goRegister">
          &nbsp;<a href="javascript:void(0)" @click="showForget">忘记密码？</a>
        </form>
        <div class="tip" v-html="tip"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import authService from '../services/authService';

const router = useRouter();
const route = useRoute();
const isLoading = ref(false);
const tip = ref('');
const usernameInput = ref(null);
const passwordInput = ref(null);
const form = reactive({
  username: '',
  password: ''
});

const handleLogin = async () => {
  if (isLoading.value) return;

  if (form.username.length === 0) {
    tip.value = '请填写用户名！';
    usernameInput.value?.focus();
    return;
  }
  if (form.password.length === 0) {
    tip.value = '请填写密码！';
    passwordInput.value?.focus();
    return;
  }

  isLoading.value = true;
  tip.value = '';

  try {
    const response = await authService.login(form.username, form.password);
    const result = response.data;

    if (result.code !== 0) {
      tip.value = result.msg || '登录失败，请检查用户名和密码';
      return;
    }

    const redirectPath = route.query.redirect || route.query.from || '/bbs/index';
    router.push(redirectPath);
  } catch (err) {
    tip.value = err.response?.data?.msg || '登录失败，请检查用户名和密码';
  } finally {
    isLoading.value = false;
  }
};

const goRegister = () => {
  router.push('/bbs/register');
};

const showForget = () => {
  tip.value = "请联系管理员，邮箱：<a href='mailto:pkuzhd@pku.edu.cn'>pkuzhd@pku.edu.cn</a>";
};

onMounted(() => {
  document.title = 'CAPUBBS - 登录';
  usernameInput.value?.focus();
});
</script>

<style scoped>
body {
  background-color: #ABC9B6;
  background-image: url("/images/bg.jpg");
  background-position: center top;
  background-repeat: no-repeat;
  margin: 0;
}
div.main{
	margin-left: auto;
	margin-right: auto;
	width: 400px;
	margin-top: 240px;
}
h1{
	text-align: center;
	color: white;
}
form{
	margin-left: auto;
	margin-right: auto;
	width: 240px;
	line-height: 30px;
}
input.text{
/* 	-webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 0, 0, 0.1) inset; */
	border-radius: 10px;
	outline: none;
	padding-left: 7px;
	background-color: #f2ffbc;
}
input.button{
	border-radius: 10px;
	background-color: #ffffff;
}
.tip{
	color: #be0000;
	text-align: center;
}
</style>
