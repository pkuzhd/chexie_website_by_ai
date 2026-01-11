<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

// 获取路由实例
const route = useRoute();

// 定义响应式数据
const bid = ref(1); // 默认版面ID
const page = ref(1); // 默认页码
const pageSize = ref(20); // 默认每页显示数量
const boardInfo = ref(null); // 版面信息
const postsList = ref([]); // 帖子列表
const totalPosts = ref(0); // 总帖子数
const totalPages = ref(0); // 总页数
const isLoading = ref(true); // 加载状态
const error = ref(null); // 错误信息

// 从URL参数更新数据
const updateParams = () => {
  const urlBid = route.query.bid;
  const urlPage = route.query.p;
  const urlPageSize = route.query.p_size;
  
  if (urlBid && !isNaN(parseInt(urlBid))) {
    bid.value = parseInt(urlBid);
  }
  
  if (urlPage && !isNaN(parseInt(urlPage))) {
    page.value = parseInt(urlPage);
  }
  
  if (urlPageSize && !isNaN(parseInt(urlPageSize))) {
    pageSize.value = parseInt(urlPageSize);
  }
};

// 加载版面信息
const loadBoardInfo = async () => {
  try {
    const response = await axios.get(`/api/boards/${bid.value}`);
    boardInfo.value = response.data.data;
  } catch (err) {
    console.error('加载版面信息失败:', err);
    // 使用模拟数据作为后备
    boardInfo.value = {
      bid: bid.value,
      name: `测试版面 ${bid.value}`,
      description: `这是测试版面 ${bid.value} 的描述信息，用于展示版面功能`,
      postCount: totalPosts.value,
      threadCount: postsList.value.length
    };
  }
};

// 加载帖子列表
const loadPostsList = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // 更新URL参数
    updateParams();
    
    // 加载版面信息
    await loadBoardInfo();
    
    // 加载帖子列表数据
    const response = await axios.get(`/api/threads`, {
      params: {
        bid: bid.value,
        p: page.value,
        p_size: pageSize.value
      }
    });
    
    const data = response.data.data;
    if (data && data.threads) {
      postsList.value = data.threads;
      totalPosts.value = data.total || data.threads.length;
    } else {
      postsList.value = [];
      totalPosts.value = 0;
    }
    
    // 计算总页数
    totalPages.value = Math.ceil(totalPosts.value / pageSize.value);
  } catch (err) {
    error.value = '加载帖子列表失败，请稍后重试';
    console.error('加载帖子列表失败:', err);
    
    // 使用模拟数据
    postsList.value = [
      {
        tid: 1,
        bid: bid.value,
        title: '这是测试主题帖 1',
        author: '用户A',
        replyer: '用户B',
        reply: 15,
        click: 234,
        postdate: new Date().toLocaleString(),
        updatetime: Date.now() / 1000
      },
      {
        tid: 2,
        bid: bid.value,
        title: '这是测试主题帖 2',
        author: '用户C',
        replyer: '用户D',
        reply: 8,
        click: 156,
        postdate: new Date().toLocaleString(),
        updatetime: Date.now() / 1000
      },
      {
        tid: 3,
        bid: bid.value,
        title: '这是测试主题帖 3',
        author: '用户E',
        replyer: '用户F',
        reply: 22,
        click: 412,
        postdate: new Date().toLocaleString(),
        updatetime: Date.now() / 1000
      },
      {
        tid: 4,
        bid: bid.value,
        title: '这是测试主题帖 4',
        author: '用户G',
        replyer: '用户H',
        reply: 5,
        click: 98,
        postdate: new Date().toLocaleString(),
        updatetime: Date.now() / 1000
      },
      {
        tid: 5,
        bid: bid.value,
        title: '这是测试主题帖 5',
        author: '用户I',
        replyer: '用户J',
        reply: 18,
        click: 356,
        postdate: new Date().toLocaleString(),
        updatetime: Date.now() / 1000
      }
    ];
    totalPosts.value = postsList.value.length;
    totalPages.value = Math.ceil(totalPosts.value / pageSize.value);
    
    // 确保版面信息有值
    if (!boardInfo.value) {
      boardInfo.value = {
        bid: bid.value,
        name: `测试版面 ${bid.value}`,
        description: `这是测试版面 ${bid.value} 的描述信息，用于展示版面功能`,
        postCount: totalPosts.value,
        threadCount: postsList.value.length
      };
    }
  } finally {
    isLoading.value = false;
  }
};

// 页面挂载时加载数据
onMounted(() => {
  loadPostsList();
});
</script>

<template>
  <div class="bbs-main">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <p>加载中...</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <!-- 论坛主页面内容 -->
    <div v-else class="main-container">
      <!-- 版面信息区域 -->
      <div class="board-info">
        <h1 class="board-title">{{ boardInfo?.name }}</h1>
        <p class="board-description">{{ boardInfo?.description }}</p>
        <div class="board-stats">
          <span>主题数: {{ boardInfo?.threadCount || 0 }}</span>
          <span>帖子数: {{ boardInfo?.postCount || 0 }}</span>
        </div>
        <div class="board-actions">
          <button class="create-thread-btn">发表新主题</button>
        </div>
      </div>
      
      <!-- 帖子列表区域 -->
      <div class="posts-list">
        <table class="posts-table">
          <thead>
            <tr>
              <th class="title-column">标题</th>
              <th class="author-column">作者</th>
              <th class="stats-column">回复/点击</th>
              <th class="last-reply-column">最后回复</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in postsList" :key="post.tid" class="post-row">
              <td class="title-column">
                <router-link :to="`/bbs/content/?bid=${bid}&tid=${post.tid}&p=1`" class="post-title">
                  {{ post.title }}
                </router-link>
              </td>
              <td class="author-column">
                <span class="author-name">{{ post.author }}</span>
              </td>
              <td class="stats-column">
                <span class="replies">{{ post.reply }}</span>
                <span class="separator">/</span>
                <span class="clicks">{{ post.click }}</span>
              </td>
              <td class="last-reply-column">
                <div class="last-reply-info">
                  <span class="replyer">{{ post.replyer }}</span>
                  <span class="time">{{ new Date(post.updatetime * 1000).toLocaleString() }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- 空列表提示 -->
        <div v-if="postsList.length === 0" class="empty-list">
          <p>该版面暂无主题帖</p>
        </div>
      </div>
      
      <!-- 分页区域 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page === 1" @click="page--; loadPostsList()">上一页</button>
        <div class="page-info">
          <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
        </div>
        <button class="page-btn" :disabled="page === totalPages" @click="page++; loadPostsList()">下一页</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bbs-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  min-height: calc(100vh - 60px);
}

.loading, .error {
  text-align: center;
  padding: 60px 20px;
  font-size: 18px;
}

.error {
  color: #ff4d4f;
}

.board-info {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.board-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #1890ff;
}

.board-description {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
}

.board-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #999;
}

.board-actions {
  text-align: right;
}

.create-thread-btn {
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #1890ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-thread-btn:hover {
  background-color: #40a9ff;
}

.posts-list {
  margin-bottom: 30px;
}

.posts-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.posts-table th {
  background-color: #f5f5f5;
  padding: 12px 16px;
  text-align: center;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
}

.posts-table th.title-column {
  text-align: left;
}

.posts-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
}

.title-column {
  width: 50%;
}

.author-column {
  width: 15%;
  text-align: center;
}

.stats-column {
  width: 20%;
  text-align: center;
}

.last-reply-column {
  width: 15%;
  text-align: center;
}

.posts-table td.title-column {
  text-align: left;
}

.post-row:hover {
  background-color: #fafafa;
}

.post-title {
  font-size: 15px;
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s;
}

.post-title:hover {
  color: #40a9ff;
}

.author-name {
  font-size: 14px;
  color: #666;
}

.stats-column {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.replies {
  color: #ff4d4f;
  font-weight: bold;
}

.separator {
  color: #999;
}

.clicks {
  color: #666;
}

.last-reply-info {
  font-size: 13px;
  color: #999;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.replyer {
  color: #666;
}

.empty-list {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid #e8e8e8;
}

.page-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #1890ff;
  background-color: transparent;
  border: 1px solid #1890ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #1890ff;
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}
</style>