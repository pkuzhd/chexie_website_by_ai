<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { userService } from '../services/userService';
import { formatDate } from '../utils/date';
import '../assets/css/general.css';

const route = useRoute();

const userInfo = ref(null);
const recentPosts = ref([]);
const recentReplies = ref([]);
const isLoading = ref(true);
const error = ref(null);

const username = computed(() => route.query.name || '');

const sexIcon = computed(() => {
  if (!userInfo.value) return '';
  return userInfo.value.sex === '男' ? '/images/user/icons/boy.png' : '/images/user/icons/girl.png';
});

const getPostLink = (post) => {
  return `/bbs/content/?bid=${post.bid}&tid=${post.tid}&p=1#1`;
};

const getReplyLink = (reply) => {
  const page = Math.ceil(reply.pid / 12);
  return `/bbs/content/?bid=${reply.bid}&tid=${reply.tid}&p=${page}#${reply.pid}`;
};

const padIndex = (index) => {
  return String(index + 1).padStart(2, '0');
};

const loadUserData = async () => {
  if (!username.value) {
    error.value = '缺少用户名参数';
    isLoading.value = false;
    return;
  }

  try {
    const [info, posts, replies] = await Promise.all([
      userService.getUserInfo(username.value),
      userService.getRecentPosts(username.value, 10),
      userService.getRecentReplies(username.value, 10),
    ]);

    if (!info) {
      error.value = '用户不存在';
    } else {
      userInfo.value = info;
      recentPosts.value = posts;
      recentReplies.value = replies;
    }
  } catch (err) {
    console.error('加载用户信息失败:', err);
    error.value = '加载失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  document.title = `CAPUBBS - 个人信息`;
  loadUserData();
});
</script>

<template>
  <div>
    <div v-if="isLoading" class="loading-container">
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>

    <template v-else>
      <div class="grxx">
        <img src="/images/user/grxx.png" class="bar">
        <div class="userpic drop-shadow">
          <img class="icon" :src="userInfo.icon">
        </div>
        <div class="infos">
          <table border="0" class="infos">
            <tr height="27px">
              <td width="120px"><img src="/images/user/icons/username.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">用户名：</span></td>
              <td><span class="info">{{ userInfo.username }}&nbsp;&nbsp;<img class="tipic" :src="sexIcon"></span></td>
              <td width="120px"><img src="/images/user/icons/qq.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">QQ：</span></td>
              <td><span class="info">{{ userInfo.qq || '未填写' }}</span></td>
            </tr>
            <tr height="27px">
              <td width="120px"><img src="/images/user/icons/level.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">星数：</span></td>
              <td><span class="info">{{ userInfo.star || 0 }}</span></td>
              <td width="120px"><img src="/images/user/icons/email.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">Email：</span></td>
              <td><span class="info">{{ userInfo.mail || '未填写' }}</span></td>
            </tr>
            <tr height="27px">
              <td width="120px"><img src="/images/user/icons/hobby.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">爱好：</span></td>
              <td><span class="info">{{ userInfo.hobby || '未填写' }}</span></td>
              <td width="120px"><img src="/images/user/icons/place.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">地点：</span></td>
              <td><span class="info">{{ userInfo.place || '未填写' }}</span></td>
            </tr>
            <tr height="27px">
              <td width="120px"><img src="/images/user/icons/time.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">上次在线：</span></td>
              <td><span class="info">{{ userInfo.lastdate || '未知' }}</span></td>
              <td width="120px"><img src="/images/user/icons/date.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">注册日期：</span></td>
              <td><span class="info">{{ userInfo.regdate || '未知' }}</span></td>
            </tr>
            <tr height="27px">
              <td width="120px"><img src="/images/user/icons/key.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">权限：</span></td>
              <td><span class="info">{{ userInfo.rights || 0 }}</span></td>
              <td width="120px"><img src="/images/user/icons/rank.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">精品：</span></td>
              <td><span class="info">{{ userInfo.extr || 0 }}</span></td>
            </tr>
            <tr height="27px">
              <td width="120px"><img src="/images/user/icons/post.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">发帖：</span></td>
              <td><span class="info">{{ userInfo.post || 0 }}</span></td>
              <td width="120px"><img src="/images/user/icons/reply.png" class="tipic">&nbsp;&nbsp;&nbsp;<span class="info">回复：</span></td>
              <td><span class="info">{{ userInfo.reply || 0 }}</span></td>
            </tr>
          </table>
        </div>
      </div>

      <div class="jqdt">
        <img src="/images/user/jqdt.png" class="bar">

        <div class="recents">
          <br>
          &nbsp;&nbsp;&nbsp;<img src="/images/user/recentposts.png" width="124px"><br>
          <table border="0" class="recent">
            <tr v-for="(post, index) in recentPosts" :key="`post-${index}`">
              <td width="50px"><span class="num">{{ padIndex(index) }}</span></td>
              <td><span class="title"><a :href="getPostLink(post)">{{ post.title }}</a></span></td>
              <td width="100px" align="right"><span class="time">{{ formatDate(post.timestamp) }}</span></td>
            </tr>
            <tr v-if="recentPosts.length === 0">
              <td colspan="3"><span class="info">暂无发帖记录</span></td>
            </tr>
          </table>
        </div>

        <div class="recents">
          <br>
          &nbsp;&nbsp;&nbsp;<img src="/images/user/recentreply.png" width="124px"><br>
          <table border="0" class="recent">
            <tr v-for="(reply, index) in recentReplies" :key="`reply-${index}`">
              <td width="50px"><span class="num">{{ padIndex(index) }}</span></td>
              <td><span class="title"><a :href="getReplyLink(reply)">{{ reply.title }}</a></span></td>
              <td width="100px" align="right"><span class="time">{{ formatDate(reply.replytime) }}</span></td>
            </tr>
            <tr v-if="recentReplies.length === 0">
              <td colspan="3"><span class="info">暂无回复记录</span></td>
            </tr>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
div.grxx, div.jqdt {
  width: 900px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 250px;
}
div.jqdt {
  margin-top: 300px;
}
img.bar {
  width: 100%;
}
div.userpic {
  background-color: white;
  width: 150px;
  margin-top: 20px;
  float: left;
}
.drop-shadow {
  -webkit-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 0, 0, 0.1) inset;
  -moz-box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1) inset;
}
img.icon {
  width: 90%;
  margin-left: 5%;
  margin-top: 10px;
  margin-bottom: 10px;
}
div.infos {
  width: 700px;
  float: left;
  margin-left: 50px;
  margin-top: 20px;
}
table.infos {
  width: 100%;
}
img.tipic {
  height: 15px;
  width: 15px;
}
span.info {
  color: #6F6F6F;
  font-size: 15px;
}
div.recents {
  float: left;
  width: 100%;
}
table.recent {
  width: 95%;
  margin-left: 5%;
}
span.title a {
  color: #6F6F6F;
  text-decoration: none;
  font-size: 17px;
}
span.num {
  color: #96AF9F;
  font-size: 30px;
  font-weight: bold;
}
span.time {
  color: #6F6F6F;
}
.loading-container, .error-container {
  width: 900px;
  margin: 250px auto 0;
  text-align: center;
  color: #6F6F6F;
  font-size: 16px;
}
</style>
