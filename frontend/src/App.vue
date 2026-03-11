<script setup>
</script>

<template>
  <div id="app">
    <!-- 导航栏占位符，会被路由组件中的navbar视图替换 -->
    <router-view name="navbar" />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view name="default" />
    </main>
  </div>
</template>

<style>
</style>
