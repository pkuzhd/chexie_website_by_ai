<script setup>
import { ref, onMounted, computed, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../composables/useAuth';
import { usePagination } from '../composables/usePagination';
import { useDebounce } from '../composables/useDebounce';
import { formatDate, getTodayDate } from '../utils/date';
import '../assets/css/general.css';
import '../assets/css/style.css';

const route = useRoute();
const router = useRouter();
const API_HOST = config.API_HOST;

const { currentUser, getCurrentUser, handleLogout } = useAuth();
const { page, totalPages, pageNumbers, jumpPageNumbers, calculatePages } = usePagination();
const { isDisabled: isClickDisabled, debounce } = useDebounce(500);

const bid = ref(2);
const extr = ref(0);
const sortBy = ref('default');
const boardInfo = ref(null);
const threads = ref([]);
const boards = ref([]);
const isLoading = ref(true);
const error = ref(null);
const showMenu = ref(false);
const showMore = ref(false);
const starttime = ref('');
const endtime = ref('');
const searchRange = ref('1');

const popoverStyle = computed(() => ({
  display: showMenu.value ? 'block' : 'none'
}));

const todayDate = computed(() => getTodayDate());

const iconUrl = '/images/icon.png';
const lockIconUrl = '/images/lock.png';
const extrIconUrl = '/images/extr.png';
const topIconUrl = '/images/top.png';
const waitingGifUrl = '/images/waiting.gif';

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

const showMoreSearch = () => {
  showMore.value = true;
  searchTimeChange();
};

const showMenuFunc = (show) => {
  showMenu.value = show;
};

const handleLink = (event, url) => {
  if (event && (event.ctrlKey || event.metaKey || event.button === 1)) {
    event.preventDefault();
    window.open(url, '_blank');
  }
};

const loadBoards = async () => {
  try {
    const response = await axios.get(`${API_HOST}/api/boardinfo`);
    boards.value = response.data.data || [];
    await loadBoardInfo();
  } catch (err) {
    console.error('加载板块列表失败:', err);
  }
};

const loadBoardInfo = async () => {
  try {
    const response = await axios.get(`${API_HOST}/api/boardinfo/${bid.value}`);
    boardInfo.value = response.data.data;
    if (boardInfo.value?.bbstitle) {
      document.title = boardInfo.value.bbstitle;
    }
    updatePagination();
  } catch (err) {
    console.error('加载板块信息失败:', err);
  }
};

const loadThreads = async () => {
  error.value = null;
  
  try {
    const response = await axios.get(`${API_HOST}/api/threads`, {
      params: {
        bid: bid.value,
        p: page.value,
        extr: extr.value,
        p_size: 25,
        sort_by: sortBy.value
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

const updatePagination = () => {
  const totalItems = extr.value === 1 ? (boardInfo.value?.extr || 0) : (boardInfo.value?.topics || 0);
  calculatePages(totalItems, page.value);
};

const goToBoard = debounce(async (targetBid) => {
  showMenu.value = false;
  
  const oldBid = bid.value;
  bid.value = targetBid;
  page.value = 1;
  
  if (oldBid !== targetBid) {
    await loadBoardInfo();
  }
  await loadThreads();
  
  const query = { bid: targetBid, p: 1 };
  if (sortBy.value !== 'default') {
    query.sort_by = sortBy.value;
  }
  router.push({ query });
});

const goToPage = debounce(async (targetPage, event) => {
  if (event) {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(`?bid=${bid.value}&p=${targetPage}`, '_blank');
      return;
    }
  }
  
  page.value = targetPage;
  await loadThreads();
  updatePagination();
  
  const query = { bid: bid.value, p: targetPage };
  if (extr.value === 1) {
    query.extr = 1;
  }
  if (sortBy.value !== 'default') {
    query.sort_by = sortBy.value;
  }
  router.push({ query });
});

const handleSortChange = async () => {
  await loadThreads();
  updatePagination();
  
  const query = { bid: bid.value, p: page.value };
  if (extr.value === 1) {
    query.extr = 1;
  }
  if (sortBy.value !== 'default') {
    query.sort_by = sortBy.value;
  }
  router.push({ query });
};

const toggleShowExtr = debounce(async (event) => {
  const newExtr = extr.value === 1 ? 0 : 1;
  if (event) {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      let url = `?bid=${bid.value}&p=${page.value}`;
      if (newExtr === 1) {
        url += `&extr=${newExtr}`;
      }
      if (sortBy.value !== 'default') {
        url += `&sort_by=${sortBy.value}`;
      }
      window.open(url, '_blank');
      return;
    }
  }
  
  extr.value = newExtr;
  await loadThreads();
  updatePagination();
  
  const query = { bid: bid.value, p: page.value };
  if (newExtr === 1) {
    query.extr = 1;
  }
  if (sortBy.value !== 'default') {
    query.sort_by = sortBy.value;
  }
  router.push({ query });
});

onMounted(() => {
  const urlBid = route.query.bid;
  const urlPage = route.query.p;
  const urlExtr = route.query.extr;
  const urlSortBy = route.query.sort_by;
  
  if (urlBid) {
    bid.value = parseInt(urlBid);
  }
  if (urlPage) {
    page.value = parseInt(urlPage);
  }
  if (urlExtr !== undefined) {
    extr.value = parseInt(urlExtr);
  }
  if (urlSortBy) {
    sortBy.value = urlSortBy;
  }
  
  getCurrentUser();
  loadBoards();
  loadThreads();
});

// 监听 URL 参数变化
watch(() => route.query, (newQuery) => {
  const newBid = newQuery.bid;
  const newPage = newQuery.p;
  const newExtr = newQuery.extr;
  const newSortBy = newQuery.sort_by;

  const oldBid = bid.value;
  const oldPage = page.value;
  const oldExtr = extr.value;
  const oldSortBy = sortBy.value;

  if (newBid) {
    bid.value = parseInt(newBid);
  } else if (oldBid && !newBid) {
    bid.value = 2;
  }
  if (newPage) {
    page.value = parseInt(newPage);
  } else if (oldPage && !newPage) {
    page.value = 1;
  }
  if (newExtr !== undefined) {
    extr.value = parseInt(newExtr);
  } else {
    extr.value = 0;
  }
  if (newSortBy) {
    sortBy.value = newSortBy;
  } else {
    sortBy.value = 'default';
  }
  
  if (oldBid !== bid.value) {
    loadBoardInfo();
  }
  if (oldSortBy !== sortBy.value || oldExtr !== extr.value || oldPage !== page.value || oldBid !== bid.value) {
    loadThreads();
  }
  
  if (boardInfo.value) {
    updatePagination();
  }
}, { immediate: false });
</script>

<template>
  <div>
    <!-- 页面头部 -->
    <div class="header">
      <br>
      <h2>{{ boardInfo?.bbstitle }}{{ extr === 1 ? '（精品区）' : '' }}</h2>
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
        <div v-if="currentUser">
          <img :src="'https://chexie.net' + currentUser.icon" class="usericon">
          <div v-if="currentUser" class="userinfo">
            <a :href="'/bbs/user?name=' + currentUser.username" target="_blank">{{ currentUser.username }}</a>
            <span>&nbsp;等级：{{ currentUser.star || 0 }}&nbsp;</span>
            <a v-if="currentUser.newmsg==0" href="/bbs/home" target="_blank">个人中心</a>
            <span v-else><br><a href='/bbs/home?pos=message' target='_blank'>您有 {{ currentUser.newmsg }} 条未读消息</a></span>
            <br>
            <a href="javascript:void(0)" @click="handleLogout">注销</a>
          </div>
        </div>
        <span v-else class="guest">
          欢迎您，游客！<a 
          :href="`/bbs/login?from=${encodeURIComponent(route.fullPath)}`"
          @click="handleLink($event, `/bbs/login?from=${encodeURIComponent(route.fullPath)}`)"
        >登录</a> 或者 <a href="/bbs/register">注册</a>
        </span>
      </div>
    </div>

    <!-- 导航栏 -->
    <div class="navigation">
      <div class="back" @click="router.push('/bbs/index')">
        <span style="margin-left:32px;"><b>返回</b></span>
      </div>
      <span style="float:left;margin-left:20px;position:relative;"> 
        <a href="#" @mouseenter="showMenuFunc(true)">CAPUBBS</a>
        <span>&nbsp;&gt;&nbsp;</span>
        <a :href="`?bid=${bid}&p=1`">{{ boardInfo?.bbstitle }}{{ extr === 1 ? '（精品区）' : '' }}</a>
        <span>&nbsp;&gt;&nbsp;</span>
        <span>第{{ page }}页</span>
        <span>&nbsp;</span>
        <a :href="extr === 1 ? `?bid=${bid}&p=${page}` : `?bid=${bid}&p=${page}&extr=1`" @click="toggleShowExtr" style="margin-left:50px">{{ extr === 1 ? '查看全部' : '查看精品区' }}</a>
        <span>&nbsp;&nbsp;</span>
        <select v-model="sortBy" @change="handleSortChange" style="margin-left:10px">
          <option value="default">按最近回复排序</option>
          <option value="tid_desc">按发帖由近到远</option>
          <option value="tid_asc">按发帖由远到近</option>
        </select>
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
            {{ extr === 1 ? '本版面精品数' : '本版面主题数' }}：<span style="color:red">{{ extr === 1 ? (boardInfo?.extr || 0) : (boardInfo?.topics || 0) }}</span> 
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

    <div v-if="currentUser" class="editor" id="editor">
			<input type="text" class="title" placeholder="帖子标题" id="raw_title">
			<div id="edi_bar"></div>
			<div id="edi_content" onfocus="editorFocus();" onblur="editorBlur();"></div>
			<br>
			<progress max="100" value="20" id="progress"></progress>
      <div id="edi_attach" onclick="attach();">添加附件</div>
			<input type="file" id="file" style="display:none;" onchange="fileselected();">
			<span>选择签名档：</span>
			<input type="radio" name="sign" value="0">不使用
			<input type="radio" name="sign" value="1" checked>1
			<input type="radio" name="sign" value="2">2
			<input type="radio" name="sign" value="3">3
			<div id="edi_submit" onclick="doreply();">发表帖子</div>
			<br><br><br>
			<span id="attachtip" style="display:none;">本帖包含的附件：</span>
			<span id="unusedattachtip" style="display:none;">您曾上传但未使用的附件：（可直接链接到本贴）<img :src="waitingGifUrl" width="15px" id="waitinggif" style="visibility:hidden;"></span>
		</div>
    <div v-if="!currentUser" class="editip" id="editip">
      <span class="editip">
        <span>您需要&nbsp;</span>
        <router-link 
          :to="`/bbs/login?from=${encodeURIComponent(route.fullPath)}`"
          @click="handleLink($event, `/bbs/login?from=${encodeURIComponent(route.fullPath)}`)"
        >登录</router-link>
        <span>&nbsp;</span>
        <span>后才能发表主题；没有账号？&nbsp;</span>
        <router-link 
          to="/bbs/register"
          @click="handleLink($event, '/bbs/register')"
        >现在注册</router-link>
        <span>&nbsp;</span>
      </span>
    </div>

    <div class="footer"></div>
  </div>
</template>

<style scoped>
.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.error {
  color: #ff4d4f;
}
</style>
