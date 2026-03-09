<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// 响应式数据
const bid = ref(2);
const page = ref(1);
const boardInfo = ref(null);
const threads = ref([]);
const boards = ref([]);
const isLoading = ref(true);
const error = ref(null);
const showMenu = ref(false);
const searchKeyword = ref('');
const searchType = ref('thread');
const searchRange = ref('1');

// 加载外部CSS
const loadExternalCSS = () => {
  const link1 = document.createElement('link');
  link1.rel = 'stylesheet';
  link1.href = 'https://capubbs-static.oss-cn-beijing.aliyuncs.com/bbs/lib/general.css';
  document.head.appendChild(link1);
  
  const link2 = document.createElement('link');
  link2.rel = 'stylesheet';
  link2.href = 'https://capubbs-static.oss-cn-beijing.aliyuncs.com/bbs/main/style.css';
  document.head.appendChild(link2);
};

// 卸载时清理
onBeforeUnmount(() => {
  const links = document.querySelectorAll('link[href*="capubbs-static"]');
  links.forEach(link => link.remove());
});

// 加载板块列表
const loadBoards = async () => {
  try {
    const response = await axios.get('/api/boardinfo');
    boards.value = response.data.data || [];
  } catch (err) {
    console.error('加载板块列表失败:', err);
    boards.value = [
      { bid: 1, name: 'act', bbstitle: '车协工作区' },
      { bid: 2, name: 'capu', bbstitle: '行者足音' },
      { bid: 3, name: 'bike', bbstitle: '车友宝典' },
      { bid: 4, name: 'water', bbstitle: '纯净水' },
      { bid: 5, name: 'acad', bbstitle: '考察与社会' },
      { bid: 6, name: 'asso', bbstitle: '五湖四海' },
      { bid: 7, name: 'skill', bbstitle: '一技之长' },
      { bid: 9, name: 'race', bbstitle: '竞赛竞技' },
      { bid: 28, name: 'web', bbstitle: '网站维护' }
    ];
  }
};

// 加载主题帖列表
const loadThreads = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get('/api/threads', {
      params: {
        bid: bid.value,
        p: page.value
      }
    });
    
    if (response.data.data && response.data.data.threads) {
      threads.value = response.data.data.threads;
    }
    
    const boardResponse = await axios.get('/api/boardinfo');
    const currentBoard = boardResponse.data.data?.find(b => b.bid === bid.value);
    boardInfo.value = currentBoard || {
      bid: bid.value,
      bbstitle: '行者足音',
      m1: '烟景',
      m2: 'dudu',
      m3: '千钨'
    };
  } catch (err) {
    error.value = '加载失败，请稍后重试';
    console.error('加载主题帖失败:', err);
    threads.value = [
      {
        tid: 8914,
        title: 'CAPU2025秋实奖合辑',
        author: '理事会',
        replyer: '飞舟',
        reply: 7,
        click: 218,
        top: 1,
        extr: 0,
        locked: 0,
        postdate: '2026-01-02',
        updatetime: 1735963441
      },
      {
        tid: 6205,
        title: '【新会员请猛戳】协会文化之——论坛ID（更新版）',
        author: '马丁Martínez',
        replyer: 'Paperduoduo',
        reply: 93,
        click: 24936,
        top: 1,
        extr: 1,
        locked: 0,
        postdate: '2013-09-26',
        updatetime: 1758348712
      },
      {
        tid: 8703,
        title: '【致自述者】相约·年年四季',
        author: '温瑶',
        replyer: '温瑶',
        reply: 21,
        click: 1036,
        top: 1,
        extr: 0,
        locked: 0,
        postdate: '2025-04-18',
        updatetime: 1747635254
      },
      {
        tid: 8911,
        title: '【25中哈远征】翻越那座天空｜七的远征日记「呼图壁-沙湾」',
        author: '月霜',
        replyer: '三里',
        reply: 28,
        click: 906,
        top: 0,
        extr: 1,
        locked: 0,
        postdate: '2025-12-21',
        updatetime: 1762418181
      }
    ];
    boardInfo.value = {
      bid: bid.value,
      bbstitle: '行者足音',
      m1: '烟景',
      m2: 'dudu',
      m3: '千钨'
    };
  } finally {
    isLoading.value = false;
  }
};

// 跳转到板块
const goToBoard = (targetBid) => {
  bid.value = targetBid;
  page.value = 1;
  showMenu.value = false;
  router.push({ query: { bid: targetBid, p: 1 } });
  loadThreads();
};

// 跳转到页面
const goToPage = (targetPage) => {
  page.value = targetPage;
  router.push({ query: { bid: bid.value, p: targetPage } });
  loadThreads();
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

// 计算总页数
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(8366 / 10));
});

// 生成页码数组
const pageNumbers = computed(() => {
  const pages = [];
  const start = Math.max(1, page.value - 4);
  const end = Math.min(totalPages.value, start + 9);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

onMounted(() => {
  loadExternalCSS();
  
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
</script>

<template>
  <div>
    <!-- 页面头部 -->
    <div class="header">
      <br>
      <h2>{{ boardInfo?.bbstitle || '行者足音' }}</h2>
      <span>
        版主：
        <a v-if="boardInfo?.m1" class="author" href="#" target="_blank">{{ boardInfo.m1 }}</a>
        <a v-if="boardInfo?.m2" class="author" href="#" target="_blank">{{ boardInfo.m2 }}</a>
        <a v-if="boardInfo?.m3" class="author" href="#" target="_blank">{{ boardInfo.m3 }}</a>
      </span>
      <br>
      <span>主题数：0/8366 新回复：7</span>
    </div>

    <!-- 导航栏 -->
    <div class="navigation">
      <div class="back" @click="router.push('/')">
        <span style="margin-left:32px;"><b>返回</b></span>
      </div>
      <span style="float:left;margin-left:20px;position:relative;"> 
        <a href="#" @mouseover="showMenu = true">CAPUBBS</a>
        &nbsp;&gt;&nbsp;
        <a href="#">{{ boardInfo?.bbstitle || '行者足音' }}</a>
        &nbsp;&gt;&nbsp;
        <span>第{{ page }}页</span>
        &nbsp;
        <a href="#" style="margin-left:50px">查看精品区</a>
        
        <div 
          class="popover" 
          id="popover" 
          v-show="showMenu" 
          @mouseleave="showMenu = false"
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
      <tr>
        <td align="left" style="text-align:left;line-height:30px">
          <div class="searchLogo"></div>
          <form action="../search/" method="post" target="_blank">
            <input type="text" name="keyword" class="search" placeholder="本版内搜索">
            <select name="type">
              <option selected value="thread">搜索帖子标题</option>
              <option value="post">搜索帖子正文</option>
            </select>
            <select id="search_range" name="time">
              <option selected value="1">近一年</option>
              <option value="2">近两年</option>
              <option value="2000">不限</option>
            </select>
            <input type="hidden" name="bid" value="2">
            <input type="hidden" name="show" value="" id="search_show">
            <input type="submit" value="搜索">
            <input type="button" value="更多搜索选项">
          </form>
        </td>
        <td style="text-align:right;line-height:22px">
          本版面主题数：<span style="color:red">8366</span> 
          今日新主题：<span style="color:red">0</span> 
          今日新帖：<span style="color:red">7</span><br>
          <a href="../sign/?view=2026-03-07" target="_blank">今日签到</a>： 
          <span style="color:red">104</span> &nbsp;
          <a href="../online/?bid=2" target="_blank">当前在线</a>： 
          <span style="color:red">10</span>&nbsp;
          （最高 <span style="color:red">107</span> 人于 2016-09-26）
        </td>
      </tr>
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
            &nbsp;&nbsp;
            <img 
              src="https://capubbs-static.oss-cn-beijing.aliyuncs.com/bbs/main/icon.png" 
              class="decorator"
            >
            &nbsp;
            <router-link 
              :to="`/bbs/content?bid=${bid}&tid=${thread.tid}&p=1`"
            >
              {{ thread.title }}
            </router-link>
            &nbsp;
            <img 
              v-if="thread.top"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ctext y='12' font-size='12'%3E📌%3C/text%3E%3C/svg%3E" 
              class="decorator"
              alt="置顶"
            >
            <img 
              v-if="thread.extr"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ctext y='12' font-size='12'%3E⭐%3C/text%3E%3C/svg%3E" 
              class="decorator"
              alt="精华"
            >
            <img 
              v-if="thread.locked"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ctext y='12' font-size='12'%3E🔒%3C/text%3E%3C/svg%3E" 
              class="decorator"
              alt="锁定"
            >
          </td>
          <td>
            <a class="author" :href="`../user?name=${thread.author}`" target="_blank">{{ thread.author }}</a>
            <br>
            <span class="date">{{ thread.postdate }}</span>
          </td>
          <td>{{ thread.reply }} / {{ thread.click }}</td>
          <td>
            <a class="author" :href="`../user?name=${thread.replyer}`" target="_blank">{{ thread.replyer }}</a>
            <br>
            <span class="date">{{ formatDate(thread.updatetime) }}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagecontrol">
      <span 
        v-if="page > 1" 
        class="page" 
        @click="goToPage(page - 1)"
      >
        上一页
      </span>
      
      <span 
        v-for="p in pageNumbers" 
        :key="p"
        :class="['page', { current: p === page }]"
        @click="goToPage(p)"
      >
        {{ p }}
      </span>
      
      <span 
        v-if="page < totalPages" 
        class="page" 
        @click="goToPage(page + 1)"
      >
        下一页
      </span>
      
      <span 
        v-if="page < totalPages" 
        class="page" 
        @click="goToPage(totalPages)"
      >
        尾页
      </span>
      
      &nbsp;跳转到：
      <select @change="goToPage(parseInt($event.target.value))">
        <option 
          v-for="p in Math.min(50, totalPages)" 
          :key="p"
          :value="p"
          :selected="p === page"
        >
          {{ p }}
        </option>
      </select>
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
