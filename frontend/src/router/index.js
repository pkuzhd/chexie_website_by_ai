import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import LoginOld from '../components/LoginOld.vue';
import Register from '../components/Register.vue';
import Navbar from '../components/Navbar.vue';
import BBSMain from '../components/BBSMain.vue';
import BBSContent from '../components/BBSContent.vue';
import BBSIndex from '../components/BBSIndex.vue';
import BBSUser from '../components/BBSUser.vue';
import authService from '../services/authService';


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
    path: '/bbs/index',
    name: 'BBSIndex',
    components: {
      default: BBSIndex
    },
    meta: {
      requiresAuth: false
    }
  },
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
    path: '/bbs/user',
    name: 'BBSUser',
    components: {
      default: BBSUser
    },
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/bbs/login',
    name: 'Login',
    components: {
      default: LoginOld
    },
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/bbs/register',
    name: 'Register',
    components: {
      default: Register
    },
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

// 重定向根路径到 /bbs/index
router.addRoute({
  path: '/',
  redirect: '/bbs/index'
});

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  let isTokenValid = false;
  if (requiresAuth || to.path === '/bbs/login') {
    isTokenValid = await authService.verifyToken();
  }

  if (requiresAuth && !isTokenValid) {
    next({ path: '/bbs/login', query: { redirect: to.fullPath } });
  } else if (to.path === '/bbs/login' && isTokenValid) {
    const redirectPath = to.query.redirect || '/';
    next(redirectPath);
  } else {
    next();
  }
});

export default router;