<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useBoardData } from '../composables/useBoardData';
import { useDebounce } from '../composables/useDebounce';
import { formatDate } from '../utils/date';
import { boardService } from '../services/boardService';
import '../assets/css/general.css';
import '../assets/css/style.css';

const router = useRouter();
const { currentUser, getCurrentUser, handleLogout } = useAuth();
const { isDisabled: isClickDisabled, debounce } = useDebounce(500);
const { boards, isLoading, loadBoards } = useBoardData();

const visibleBoards = computed(() => {
  return boards.value.filter(b => b.hide === 0);
});

const otherBoards = computed(() => {
  return boards.value.filter(b => b.hide === 1);
});

const hotThreads = ref([]);
const isLoadingHot = ref(true);
const showOthers = ref(false);

const loadHotThreads = async () => {
  try {
    const response = await boardService.getHotThreads({ limit: 10 });
    hotThreads.value = response || [];
  } catch (err) {
    console.error('加载热门帖子失败:', err);
  } finally {
    isLoadingHot.value = false;
  }
};

const goToBoard = debounce(async (targetBid, event) => {
  if (event) {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(`/bbs/main?bid=${targetBid}`, '_blank');
      return;
    }
  }
  router.push(`/bbs/main?bid=${targetBid}`);
});

const showall = () => {
  showOthers.value = true;
};

onMounted(() => {
  document.title = 'CAPUBBS - 选择讨论区';
  getCurrentUser();
  loadBoards();
  loadHotThreads();
});
</script>

<template>
  <div>
    <div class="head">
      <div class="user">
        <span v-if="currentUser">
          <img :src="'https://chexie.net' + currentUser.icon" class="usericon">
          <div class="userinfo">
            <a :href="'/bbs/user?name=' + currentUser.username" target="_blank">{{ currentUser.username }}</a>
            <span>&nbsp;等级：{{ currentUser.star || 0 }}&nbsp;</span>
            <a v-if="currentUser.newmsg==0" href="/bbs/home" target="_blank">个人中心</a>
            <span v-else><br><a href='/bbs/home?pos=message' target='_blank'>您有 {{ currentUser.newmsg }} 条未读消息</a></span>
            <br>
            <a href="javascript:void(0)" @click="handleLogout">注销</a>
          </div>
        </span>
        <span v-else class='guest'>欢迎您，游客！<a href='/bbs/login?from=%2Fbbs%2Findex'>登录</a> 或者 <a href='/bbs/register'>注册</a></span>
      </div>
    </div>
    
    <div class="content">
      <div class="left">
        <div class="title">
          <img src="/images/tlbk.png" width="150">
        </div>
        
        <div v-if="isLoading" class="loading">
          <p>加载中...</p>
        </div>
        
        <div v-else>
          <div 
            v-for="board in visibleBoards" 
            :key="board.bid"
            class='block raised'
            @click="goToBoard(board.bid, $event)"
          >
            <img :src="'/images/b' + board.bid + '.jpeg'" width='150' height='110'>
            <br>
            <span class='title'>{{ board.bbstitle }}</span>
            <br>
            <span class='desc'></span>
            <br>
            <span class='banzhu'>
              版主：<a v-if="board.m1" class='author' :href="'../user?name=' + board.m1" target='_blank'>{{ board.m1 }}</a>
              <a v-if="board.m2" class='author' :href="'../user?name=' + board.m2" target='_blank'>{{ board.m2 }}</a>
              <a v-if="board.m3" class='author' :href="'../user?name=' + board.m3" target='_blank'>{{ board.m3 }}</a>
              <a v-if="board.m4" class='author' :href="'../user?name=' + board.m4" target='_blank'>{{ board.m4 }}</a>
            </span>
          </div>
          
          <div style="clear:both;"></div>
          <br>
          <a href="javascript:void(0)" @click="showall" id="showothers" v-if="!showOthers">显示所有版面↓</a>
          <div id="others" v-show="showOthers" style="float:left;margin-top:20px;">
            <a 
              v-for="board in otherBoards" 
              :key="board.bid"
              :href="`/bbs/main?bid=${board.bid}`"
              @click="goToBoard(board.bid, $event)" 
              style='margin-top:20px;margin-right:10px;'
            >
              {{ board.bbstitle }}
            </a>
          </div>
        </div>
      </div>

      <!-- TODO: 热门帖子列表 -->
      <div class="right">
        <div class="title">
          <img src="/images/ltrd.png" width="150">
        </div>
        <div class="hot">
          <div v-if="isLoadingHot" class="loading">
            <p>加载中...</p>
          </div>
          <ul v-else>
            <li v-for="thread in hotThreads" :key="`${thread.bid}-${thread.tid}`">
              <a :href="`../content/?bid=${thread.bid}&tid=${thread.tid}&p=1#1`">
                {{ thread.title }}
              </a>
              <br>
              <span class='hint'>
                <span class='hint2'>{{ thread.replyer || thread.author }}</span>
                &nbsp;于&nbsp;
                <span class='hint2'>{{ formatDate(thread.timestamp) }}</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
body{
    background-color: #ABC9B6;
    background-image: url("/assets/images/static/bg.jpg");
    background-position: center top;
    background-repeat: no-repeat;
    margin: 0;
}
a.author{
	color: #5c7084;
	font-size: inherit;
}
.head{
	height: 230px;
}
.content{
	width: 900px;
	height: 400px;
	margin-left: auto;
	margin-right: auto;
}
.left{
	width: 600px;
	float: left;
}
.right{
	width: 300px;
	height: 100%;
	float: left;
}
div.title{
	width: 100%;
	height: 80px;
}
.block{
	width: 150px;
	height: 180px;
	background-color: white;
	float: left;
	margin-right: 35px;
	margin-bottom: 30px;
	color: #808382;
}
.drop-shadow{
	-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.1) inset;
	-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
}
.drop-shadow::before, .drop-shadow::after { content: ""; position: absolute; z-index: -2; }
.raised{
	-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.1) inset;
	-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
	-webkit-transition: box-shadow 0.3s, -webkit-transform 0.3s;
	-moz-transition: box-shadow 0.3s, -moz-transform 0.3s;;
	-o-transition: box-shadow 0.3s, -o-transform 0.3s;;
	-ms-transition: box-shadow 0.3s, -ms-transform 0.3s;;
	cursor: pointer;
}
.raised:hover{
	-webkit-box-shadow: 0 15px 10px -10px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.1) inset;
	-moz-box-shadow: 0 15px 10px -10px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
	box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
/*
 * 	-webkit-transform: rotate(15deg);
 * 		-moz-transform: rotate(15deg);
 * 			-o-transform: rotate(15deg);
 * 				-ms-transform: rotate(15deg);
 * 				*/
}


span.title{
	font-size: 16px;
	margin: 10px;
}
span.desc{
	font-size: 10px;
}
span.banzhu{
	font-size: 12px;
	float: right;
	margin: 5px;
}
div.hot{
	margin-left: 10px;
	font-size: 16px;
	line-height: 32px;
}
div.hot ul {
	padding-left: 15px;
}
div.hot a{
	text-decoration: none;
	color: #3C627F;
}
div.hot a:hover{
	text-decoration: underline;
}
div.user{
	float: right;
	margin-top: 120px;
	margin-right: 160px;
}
span.guest{
	position: relative;
	top: 40px;
}
img.usericon{
	-webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.1) inset;
	-moz-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
	box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
	width: 64px;
	height: 64px;
	background-color: white;
	border: 3px solid white;
	float: left;
}
div.userinfo{
	float: left;
	margin-left: 25px;
	font-size: 13px;
	line-height: 24px;
	margin-top: 0px;
}
a{
	text-decoration: none;
	color: #5c7084;
}
a:hover{
	text-decoration: underline;
}
span.hint{
	font-size: 14px
}
span.hint2{
	color:#966347
}
</style>
