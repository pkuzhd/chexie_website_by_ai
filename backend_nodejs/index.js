const express = require('express');

// 初始化Express应用
const app = express();

// 配置中间件
app.use(express.json());

// 定义/test接口
app.get('/test', (req, res) => {
  res.json({ result: 'test' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
