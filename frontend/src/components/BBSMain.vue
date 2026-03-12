<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import config from '../config';
import '../assets/css/general.css';
import '../assets/css/style.css';

const route = useRoute();
const router = useRouter();

// API配置
const API_HOST = config.API_HOST;

// 响应式数据
const bid = ref(2);
const page = ref(1);
const boardInfo = ref(null);
const threads = ref([]);
const boards = ref([]);
const isLoading = ref(true);
const error = ref(null);
const showMenu = ref(false);
const popoverStyle = ref({});
const searchKeyword = ref('');
const searchType = ref('thread');
const searchRange = ref('1');
const isClickDisabled = ref(false);

// 搜索相关
const showMore = ref(false);
const starttime = ref('');
const endtime = ref('');

// 图片路径（使用public目录下的绝对路径）
const iconUrl = ref('/images/icon.png');
const lockIconUrl = ref('/images/lock.png');
const extrIconUrl = ref('/images/extr.png');
const topIconUrl = ref('/images/top.png');

// 计算今日日期
const todayDate = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
});

// 搜索时间变化
const searchTimeChange = () => {
  const now = new Date();
  const last = parseInt(searchRange.value);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const startDate = new Date(currentYear - last, currentMonth - 1, currentDay);
  const endDate = new Date(currentYear, currentMonth - 1, currentDay);
  starttime.value = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
  endtime.value = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
};

// 显示更多搜索选项
const showMoreSearch = () => {
  showMore.value = true;
  searchTimeChange();
};

// 显示/隐藏菜单
const showMenuFunc = (show) => {
  showMenu.value = show;
  // 使用 Vue 响应式方法设置样式
  popoverStyle.value = show ? { display: 'block' } : { display: 'none' };
};

// 处理链接点击
const handleLink = (event, url) => {
  if (event && (event.ctrlKey || event.metaKey || event.button === 1)) {
    event.preventDefault();
    window.open(url, '_blank');
  }
};

// 加载板块列表
const loadBoards = async () => {
  try {
    const response = await axios.get(`${API_HOST}/api/boardinfo`);
    boards.value = response.data.data || [];
    await loadBoardInfo();
  } catch (err) {
    console.error('加载板块列表失败:', err);
  }
};

// 加载板块信息
const loadBoardInfo = async () => {
  try {
    const response = await axios.get(`${API_HOST}/api/boardinfo/${bid.value}`);
    boardInfo.value = response.data.data;
    // 更新网页标题
    if (boardInfo.value?.bbstitle) {
      document.title = boardInfo.value.bbstitle;
    }
    // 重新计算页码
    calculatePages();
  } catch (err) {
    console.error('加载板块信息失败:', err);
  }
};

// 加载主题帖列表
const loadThreads = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get(`${API_HOST}/api/threads`, {
      params: {
        bid: bid.value,
        p: page.value,
        p_size: 25
      }
    });
    
    if (response.data.data && response.data.data.threads) {
      threads.value = response.data.data.threads;
    }
    
  } catch (err) {
    error.value = '加载失败，请稍后重试';
    console.error('加载主题帖失败:', err);
  } finally {
    isLoading.value = false;
  }
};

// 跳转到板块（带防抖机制）
const goToBoard = (targetBid) => {
  if (isClickDisabled.value) {
    return;
  }
  
  isClickDisabled.value = true;
  
  bid.value = targetBid;
  page.value = 1;
  showMenu.value = false;
  router.push({ query: { bid: targetBid, p: 1 } });
  
  setTimeout(() => {
    isClickDisabled.value = false;
  }, 500);
};

// 跳转到页面（带防抖机制）
const goToPage = (targetPage, event) => {
  if (event && (event.ctrlKey || event.metaKey || event.button === 1)) {
    event.preventDefault();
    window.open(`?bid=${bid.value}&p=${targetPage}`, '_blank');
    return;
  }
  if (event) event.preventDefault();
  
  if (isClickDisabled.value) {
    return;
  }
  
  isClickDisabled.value = true;
  
  page.value = targetPage;
  router.push({ query: { bid: bid.value, p: targetPage } });
  
  setTimeout(() => {
    isClickDisabled.value = false;
  }, 500);
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 总页数
const totalPages = ref(1);

// 页码数组
const pageNumbers = ref([]);

// 跳转页码数组
const jumpPageNumbers = ref([]);

// 计算页码的函数
const calculatePages = () => {
  // 计算总页数
  totalPages.value = Math.max(1, Math.ceil((boardInfo.value?.topics || 0) / 25));
  
  // 生成分页显示的页码数组
  const pages = [];
  const start = Math.max(1, page.value - 4);
  const end = Math.min(totalPages.value, start + 9);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  pageNumbers.value = pages;
  
  // 生成智能跳转页码数组
  generateJumpPages();
};

// 生成智能跳转页码数组
const generateJumpPages = () => {
  const pages = [];
  let counter = 0;
  
  // 从当前页向前生成
  for (let i = page.value; i > 0;) {
    counter++;
    pages.unshift(i);
    if (counter < 50) i--;
    else if (counter < 100) i -= 10;
    else if (counter < 150) i -= 100;
    else if (counter < 200) i -= 1000;
    else break;
  }
  
  // 确保包含第1页
  if (pages[0] !== 1) {
    pages.unshift(1);
  }
  
  // 从当前页向后生成
  counter = 0;
  for (let i = page.value + 1; i <= totalPages.value;) {
    counter++;
    pages.push(i);
    if (counter < 50) i++;
    else if (counter < 100) i += 10;
    else if (counter < 150) i += 100;
    else if (counter < 200) i += 1000;
    else break;
  }
  
  // 确保包含最后一页
  if (pages[pages.length - 1] !== totalPages.value) {
    pages.push(totalPages.value);
  }
  
  jumpPageNumbers.value = pages;
};

onMounted(() => {
  
  const urlBid = route.query.bid;
  const urlPage = route.query.p;
  
  if (urlBid) {
    bid.value = parseInt(urlBid);
  }
  if (urlPage) {
    page.value = parseInt(urlPage);
  }
  
  loadBoards();
  loadThreads();
});

// 监听 URL 参数变化
watch(() => route.query, (newQuery) => {
  const newBid = newQuery.bid;
  const newPage = newQuery.p;
  
  if (newBid) {
    bid.value = parseInt(newBid);
  }
  if (newPage) {
    page.value = parseInt(newPage);
  }
  
  loadThreads();
  calculatePages();
}, { immediate: false });
</script>

<template>
  <div>
    <!-- 页面头部 -->
    <div class="header">
      <br>
      <h2>{{ boardInfo?.bbstitle}}</h2>
      <span>
        <span>版主：</span>
        <a v-if="boardInfo?.m1" class="author" href="#" target="_blank">{{ boardInfo.m1 }}</a>
        <a v-if="boardInfo?.m2" class="author" href="#" target="_blank">{{ boardInfo.m2 }}</a>
        <a v-if="boardInfo?.m3" class="author" href="#" target="_blank">{{ boardInfo.m3 }}</a>
        <a v-if="boardInfo?.m4" class="author" href="#" target="_blank">{{ boardInfo.m4 }}</a>
      </span>
      <br>
      <span>主题数：{{ boardInfo?.newpost || 0 }}/{{ boardInfo?.topics || 0 }} 新回复：{{ boardInfo?.newreply || 0 }}</span>
      <div class="user">
        <span class="guest">
          欢迎您，游客！<a href="#">登录</a> 或者 <a href="#">注册</a>
        </span>
      </div>
    </div>

    <!-- 导航栏 -->
    <div class="navigation">
      <div class="back" @click="router.push('/')">
        <span style="margin-left:32px;"><b>返回</b></span>
      </div>
      <span style="float:left;margin-left:20px;position:relative;"> 
        <a href="#" @mouseenter="showMenuFunc(true)">CAPUBBS</a>
        <span>&nbsp;&gt;&nbsp;</span>
        <a href="#">{{ boardInfo?.bbstitle }}</a>
        <span>&nbsp;&gt;&nbsp;</span>
        <span>第{{ page }}页</span>
        <span>&nbsp;</span>
        <a href="#" style="margin-left:50px">查看精品区</a>
        <div 
          class="popover" 
          :style="popoverStyle" 
          v-if="showMenu" 
          @mouseleave="showMenuFunc(false)"
        >
          <table class="popover">
            <tr v-for="b in boards" :key="b.bid">
              <td @click="goToBoard(b.bid)">{{ b.bbstitle }}</td>
            </tr>
          </table>
        </div>
      </span>
    </div>

    <!-- 搜索区域 -->
     
    <table class="searchArea">
      <tbody>
        <tr>
          <td align="left" style="text-align:left;line-height:30px">
            <div class="searchLogo"></div>
            <form action="/bbs/search/" method="post" target="_blank">
              <input type="text" name="keyword" class="search" placeholder="本版内搜索" style="margin-right: 4px;">
              <select name="type" style="margin-right: 4px;">
                <option selected value="thread">搜索帖子标题</option>
                <option value="post">搜索帖子正文</option>
              </select>
              <select id="search_range" name="time" v-model="searchRange" @change="searchTimeChange" style="margin-right: 4px;">
                <option selected value="1">近一年</option>
                <option value="2">近两年</option>
                <option value="2000">不限</option>
              </select>
              <input type="hidden" name="bid" :value="bid">
              <input type="hidden" name="show" value="" id="search_show">
              <input type="submit" value="搜索" style="margin-right: 4px;">
              <input type="button" @click="showMoreSearch" value="更多搜索选项" v-show="!showMore">
              <br>
              <span v-show="showMore" style="margin-top:5px" id="search_more">
                起始时间：<input id="starttime" type="text" name="starttime" class="search" style="padding-left:5px;width:90px" :value="starttime">
                &nbsp;&nbsp;终止时间：<input id="endtime" type="text" name="endtime" class="search" style="padding-left:5px;width:90px" :value="endtime">
                &nbsp;&nbsp;作者：<input type="text" name="author" class="search" style="padding-left:5px;width:130px" placeholder="不限制则不填" value="">
              </span>
            </form>
          </td>
          <td style="text-align:right;line-height:22px">
            本版面主题数：<span style="color:red">{{ boardInfo?.topics || 0 }}</span> 
            今日新主题：<span style="color:red">{{ boardInfo?.todaynewthread || 0 }}</span> 
            今日新帖：<span style="color:red">{{ boardInfo?.todaynewpost || 0 }}</span><br>
            <a :href="`../sign/?view=${todayDate}`" target="_blank">今日签到</a>：
            <span style="color:red">{{ boardInfo?.todaysign || 0 }}</span>&nbsp;
            <a :href="`../online/?bid=${bid}`" target="_blank">当前在线</a>： 
            <span style="color:red">{{ boardInfo?.online || 0 }}</span>&nbsp;（最高 <span style="color:red">{{ boardInfo?.maxonline || 107 }}</span> 人于 {{ boardInfo?.maxonlinetime || '2016-09-26' }}）
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <p>加载中...</p>
    </div>

    <!-- 错误信息 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <!-- 主题帖列表 -->
    <div v-else class="mainandbts">
      <table class="main" id="table">
        <tbody>
          <tr class="head">
            <th>文章标题</th>
            <th>作者</th>
            <th>回复数/查看数</th>
            <th>最后回复</th>
          </tr>
          <tr 
            v-for="(thread, index) in threads" 
            :key="thread.tid"
            :class="['content', index % 2 === 0 ? 'odd' : 'even']"
          >
            <td style="text-align:left;">
              <span>&nbsp;&nbsp;</span>
              <img 
                :src="iconUrl" 
                class="decorator"
              >
              <span>&nbsp;</span>
              <router-link 
                :to="`/bbs/content?bid=${bid}&tid=${thread.tid}&p=1`"
                @click="handleLink($event, `/bbs/content?bid=${bid}&tid=${thread.tid}&p=1`)"
              >
                {{ thread.title }}
              </router-link>
              <span>&nbsp;</span>
              <img 
                v-if="thread.top"
                :src="topIconUrl" 
                class="decorator"
                alt="置顶"
              >
              <span v-if="thread.top">&nbsp;</span>
              <img 
                v-if="thread.extr"
                :src="extrIconUrl" 
                class="decorator"
                alt="精华"
              >
              <span v-if="thread.extr">&nbsp;</span>
              <img 
                v-if="thread.locked"
                :src="lockIconUrl" 
                class="decorator"
                alt="锁定"
              >
              <span v-if="thread.locked">&nbsp;</span>
            </td>
            <td>
              <a class="author" :href="`../user?name=${thread.author}`" target="_blank">{{ thread.author }}</a>
              <br>
              <span class="date">{{ thread.postdate }}</span>
            </td>
            <td>{{ thread.reply }} / {{ thread.click }}</td>
            <td>
              <a class="author" :href="`../user?name=${thread.replyer}`" target="_blank">{{ thread.replyer? thread.replyer : thread.author }}</a>
              <br>
              <span class="date">{{ formatDate(thread.timestamp) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <br>
    <!-- 分页控件 -->
    <div class="pagecontrol">
      <a 
        v-if="page > 1" 
        class="page" 
        :href="`?bid=${bid}&p=1`"
        @click="goToPage(1, $event)"
      >首页</a>

      <a 
        v-if="page > 1" 
        class="page" 
        :href="`?bid=${bid}&p=${page - 1}`"
        @click="goToPage(page - 1, $event)"
      >上一页</a>
      
      <template v-for="p in pageNumbers" :key="p">
        <span 
          v-if="p === page"
          class="page current"
        >{{ p }}</span>
        <a 
          v-else
          class="page"
          :href="`?bid=${bid}&p=${p}`"
          @click="goToPage(p, $event)"
        >{{ p }}</a>
      </template>
      
      <a 
        v-if="page < totalPages" 
        class="page" 
        :href="`?bid=${bid}&p=${page + 1}`"
        @click="goToPage(page + 1, $event)"
      >下一页</a>
      
      <a 
        v-if="page < totalPages" 
        class="page" 
        :href="`?bid=${bid}&p=${totalPages}`"
        @click="goToPage(totalPages, $event)"
      >尾页</a>
      <span>&nbsp;跳转到：</span>
      <select @change="goToPage(parseInt($event.target.value))">
        <option 
          v-for="p in jumpPageNumbers" 
          :key="p"
          :value="p"
          :selected="p === page"
        >{{ p }}</option>
      </select>
    </div>

    <!-- 编辑区域 -->
    <div class="editip" id="editip">
      <span class="editip">
        <span>您需要&nbsp;</span>
        <router-link 
          :to="`/login?from=${encodeURIComponent($route.fullPath)}`"
          @click="handleLink($event, `/login?from=${encodeURIComponent($route.fullPath)}`)"
        >登录</router-link>
        <span>&nbsp;</span>
        <span>后才能发表主题；没有账号？&nbsp;</span>
        <router-link 
          to="/register"
          @click="handleLink($event, '/register')"
        >现在注册</router-link>
        <span>&nbsp;</span>
      </span>
    </div>

    <!-- 底部留白 -->
    <div class="footer"></div>
  </div>
</template>

<style>
/* 只保留必要的加载和错误样式，其他使用外部CSS */
.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: #ff4d4f;
}
</style>
