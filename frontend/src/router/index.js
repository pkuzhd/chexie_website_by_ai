import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Navbar from '../components/Navbar.vue';
import ForumContent from '../components/ForumContent.vue';
import BBSMain from '../components/BBSMain.vue';

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
    path: '/',
    name: 'Home',
    components: {
      default: Home,
      navbar: Navbar
    },
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/posts',
    name: 'Posts',
    components: {
      default: Posts,
      navbar: Navbar
    },
    meta: {
      requiresAuth: true // 需要登录才能访问
    }
  },
  {
    path: '/content',
    name: 'ForumContent',
    components: {
      default: ForumContent,
      navbar: Navbar
    },
    meta: {
      requiresAuth: false // bid=2不需要登录即可访问
    }
  },
  {
    path: '/bbs/content/',
    name: 'BBSForumContent',
    components: {
      default: ForumContent,
      navbar: Navbar
    },
    meta: {
      requiresAuth: false // bid=2不需要登录即可访问
    }
  },
  {
    path: '/bbs/main/',
    name: 'BBSMain',
    components: {
      default: BBSMain,
      navbar: Navbar
    },
    meta: {
      requiresAuth: false // 版面页面不需要登录即可访问
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false // 不需要登录即可访问
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫：检查是否需要登录
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，跳转到登录页并携带原路径作为redirect参数
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else if (!requiresAuth && isAuthenticated && to.path === '/login') {
    // 已登录且访问登录页，检查是否有redirect参数
    const redirectPath = to.query.redirect || '/';
    next(redirectPath);
  } else {
    // 其他情况正常访问
    next();
  }
});

export default router;