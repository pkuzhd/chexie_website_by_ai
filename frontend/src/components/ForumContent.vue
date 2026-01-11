<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 定义响应式数据
const thread = ref(null);
const posts = ref([]);
const bid = ref(2);
const tid = ref(1000);
const page = ref(1);
const isLoading = ref(true);
const error = ref(null);

// 加载帖子内容
const loadContent = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // 加载主题帖信息
    const threadResponse = await axios.get(`/api/threads?bid=${bid.value}&tid=${tid.value}`);
    thread.value = threadResponse.data.data;
    
    // 加载回复帖子
    const postsResponse = await axios.get(`/api/posts?bid=${bid.value}&tid=${tid.value}`);
    // 检查返回数据结构
    if (postsResponse.data.data && postsResponse.data.data.posts) {
      // 帖子列表数据结构
      posts.value = postsResponse.data.data.posts;
    } else {
      // 单个帖子数据结构
      posts.value = [postsResponse.data.data];
    }
  } catch (err) {
    error.value = '加载内容失败，请稍后重试';
    console.error('加载内容失败:', err);
    
    // 使用模拟数据
    thread.value = {
      bid: 2,
      tid: 8346,
      title: '【致新行者】定义你自己的故事',
      author: '作者名称',
      replyer: '最后回复者',
      click: 1234,
      reply: 56,
      timestamp: Date.now() / 1000,
      postdate: new Date().toLocaleString()
    };
    
    posts.value = [
      {
        bid: 2,
        tid: 8346,
        pid: 1,
        title: '【致新行者】定义你自己的故事',
        author: '作者名称',
        text: `【致新行者】定义你自己的故事"会不会，有一天，时间真的能倒退，退回你的我的回不去的悠悠的岁月"也许是哪次走进秋天的拉练使你有了感喟，你想起笔写一篇足音也许是和相处许久的好友，你决定在这里发上一篇生日帖也许只是一次平凡的晚训、出摊、酸奶局、夜聊，在一个夜晚你忽然有了你自己的感悟又也许你期盼的盛夏终于要到来，你终于提笔写下了一篇自述无论是何种场景，当你溢出满怀情感，请不要吝啬你的笔墨——请在这里留下一篇，独属于你的，行者足音足音版不只是花花绿绿的生日贴、不只是藏起整个夏天的暑期日志，这里不只是老东西们交流感情的一隅角落，更是给所有人分享感喟、记录自身的一片天堂在这里，无论入协时间长短，无论文笔好坏（你看笔者的文笔就很生拉硬凑）每一句真诚的话语都会被尊重，每一颗炽热的心都会被看见请在这里，定义独属于你自己的故事留下一篇文字吧在多年以后，甚至只是数月以后你都可能瞥见不一样的你自己你会看到那些岁月如何奔驰看到协会的秋、冬、春、夏如何在你身上打下不可磨灭的印记你会感慨自己的状态是如何一步步走向不同的样子或许总有一天 你也会在新朋友写下的足音里 瞥见曾经的自己26行者们，这里是北大车协，欢迎你们的到来更期待你们在这里定义你们自己的故事`,
        replytime: Date.now() / 1000,
        updatetime: Date.now() / 1000,
        ip: '127.0.0.1'
      },
      // 可以添加更多模拟回复
    ];
  } finally {
    isLoading.value = false;
  }
};

// 页面挂载时加载内容
onMounted(() => {
  loadContent();
});
</script>

<template>
  <div class="forum-content">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <p>加载中...</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <!-- 论坛内容 -->
    <div v-else class="content-container">
      <!-- 主题帖标题区域 -->
      <div class="thread-header">
        <h1 class="thread-title">{{ thread?.title }}</h1>
        <div class="thread-info">
          <span class="author">作者: {{ thread?.author }}</span>
          <span class="replyer">最后回复: {{ thread?.replyer }}</span>
          <span class="click">点击: {{ thread?.click }}</span>
          <span class="reply">回复: {{ thread?.reply }}</span>
          <span class="postdate">{{ thread?.postdate }}</span>
        </div>
      </div>
      
      <!-- 帖子列表 -->
      <div class="posts-list">
        <div 
          v-for="(post, index) in posts" 
          :key="post.pid" 
          class="post-item"
          :class="{ 'main-post': index === 0 }"
        >
          <!-- 帖子头部信息 -->
          <div class="post-header">
            <div class="post-author-info">
              <div class="author-name">{{ post.author }}</div>
              <div class="author-role">普通会员</div>
            </div>
            <div class="post-meta">
              <span class="post-time">{{ new Date(post.replytime * 1000).toLocaleString() }}</span>
              <span class="post-ip">{{ post.ip }}</span>
              <span class="post-floor">#{{ post.pid }}</span>
            </div>
          </div>
          
          <!-- 帖子内容 -->
          <div class="post-content">
            <div class="post-text" v-html="post.text.replace(/\n/g, '<br>')"></div>
          </div>
          
          <!-- 帖子操作按钮 -->
          <div class="post-actions">
            <button class="action-btn reply-btn">回复</button>
            <button class="action-btn edit-btn">编辑</button>
            <button class="action-btn quote-btn">引用</button>
          </div>
        </div>
      </div>
      
      <!-- 分页区域 -->
      <div class="pagination">
        <button class="page-btn" :disabled="page === 1">上一页</button>
        <span class="page-info">第 {{ page }} 页</span>
        <button class="page-btn">下一页</button>
      </div>
      
      <!-- 回复表单 -->
      <div class="reply-form">
        <h3>发表回复</h3>
        <textarea 
          class="reply-textarea" 
          placeholder="请输入回复内容..."
          rows="8"
        ></textarea>
        <div class="reply-form-actions">
          <button class="submit-btn">提交回复</button>
          <button class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forum-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  min-height: 100vh;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #ff4d4f;
}

.thread-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e8e8e8;
}

.thread-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #1890ff;
}

.thread-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.posts-list {
  margin-bottom: 30px;
}

.post-item {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.post-item.main-post {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.post-author-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.author-name {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.author-role {
  font-size: 12px;
  color: #999;
}

.post-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.post-content {
  margin-bottom: 15px;
}

.post-text {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 6px 12px;
  font-size: 12px;
  color: #1890ff;
  background-color: transparent;
  border: 1px solid #1890ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background-color: #e6f7ff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px 0;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
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

.reply-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
}

.reply-form h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.reply-textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 15px;
}

.reply-form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.submit-btn {
  padding: 8px 20px;
  font-size: 14px;
  color: #fff;
  background-color: #1890ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  background-color: #40a9ff;
}

.cancel-btn {
  padding: 8px 20px;
  font-size: 14px;
  color: #666;
  background-color: transparent;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  color: #333;
  border-color: #999;
}
</style>