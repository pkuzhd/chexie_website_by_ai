const express = require('express');
require('dotenv').config();
const cors = require('cors');

// 导入数据库连接
const sequelize = require('./config/db');

// 导入路由
const authRoutes = require('./routes/auth');

// 初始化Express应用
const app = express();

// 配置中间件
app.use(express.json());
app.use(cors());

// 定义/test接口
app.get('/test', (req, res) => {
  res.json({ result: 'test' });
});

// 使用认证路由
app.use('/auth', authRoutes);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
