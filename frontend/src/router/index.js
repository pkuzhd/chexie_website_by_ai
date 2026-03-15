import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Navbar from '../components/Navbar.vue';
import BBSMain from '../components/BBSMain.vue';
import BBSContent from '../components/BBSContent.vue';
import config from '../config';


// 导入其他组件（示例）
// import Home from '../components/Home.vue';
// import Posts from '../components/Posts.vue';

// 简单的首页组件作为示例
const Home = {
  template: `
    <div class="home">
      <h1>欢迎来到论坛</h1>
      <p>这是论坛首页</p>
    </div>
  `
};

// 简单的帖子列表组件作为示例
const Posts = {
  template: `
    <div class="posts">
      <h1>帖子列表</h1>
      <p>这里显示帖子列表</p>
    </div>
  `
};

const routes = [
  {
    path: '/bbs/main',
    name: 'BBSMain',
    components: {
      default: BBSMain,
      // navbar: Navbar
    },
    meta: {
      requiresAuth: false // 版面页面不需要登录即可访问
    }
  },
  {
    path: '/bbs/main_new',
    name: 'BBSMainNew',
    components: {
      default: BBSMain,
      // navbar: Navbar
    },
    meta: {
      requiresAuth: false // 版面页面不需要登录即可访问
    }
  },
  {
    path: '/bbs/content',
    name: 'BBSContent',
    components: {
      default: BBSContent,
      // navbar: Navbar
    },
    meta: {
      requiresAuth: false // 帖子内容页面不需要登录即可访问
    }
  },
  {
    path: '/bbs/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false // 不需要登录即可访问
    }
  },
  {
    path: '/bbs/register',
    name: 'Register',
    component: Register,
    meta: {
      requiresAuth: false // 不需要登录即可访问
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

// 重定向根路径到 /bbs/main
router.addRoute({
  path: '/',
  redirect: '/bbs/main'
});

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// 验证token是否有效的函数
const verifyToken = async () => {
  try {
    const token = getCookie('token');

    const response = await axios.get(`${config.API_HOST}/api/auth_legacy/current`, {
      withCredentials: true
    });
    return response.data && response.data.username;
  } catch (error) {
    console.error('验证token失败:', error);
    return false;
  }
};

// 路由守卫：检查是否需要登录
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = localStorage.getItem('token') !== null;

  const legacyToken = getCookie('token');
  const isLegacyAuthenticated = legacyToken !== null;

  console.log('legacyToken:', legacyToken);
  console.log('token:', localStorage.getItem('token'));
  console.log('requiresAuth:', requiresAuth);
  console.log('isAuthenticated:', isAuthenticated);
  
  // 如果有legacyToken，向后端确认是否有效
  let isTokenValid = false;
  if (isLegacyAuthenticated) {
    isTokenValid = await verifyToken();
    console.log('token验证结果:', isTokenValid);
  }
  
  if (requiresAuth && !isAuthenticated && !isTokenValid) {
    console.log('需要登录但未登录，跳转到登录页并携带原路径作为redirect参数');
    // 需要登录但未登录，跳转到登录页并携带原路径作为redirect参数
    next({ path: '/bbs/login', query: { redirect: to.fullPath } });
  } else if (!requiresAuth && (isAuthenticated || isTokenValid) && to.path === '/bbs/login') {
    
    console.log('已登录且访问登录页，检查是否有redirect参数');
    // 已登录且访问登录页，检查是否有redirect参数
    const redirectPath = to.query.redirect || '/';
    next(redirectPath);
  } else {
    console.log('其他情况正常访问');
    // 其他情况正常访问
    next();
  }
});

export default router;