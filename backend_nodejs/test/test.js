const http = require('http');

// 测试/test接口
function testTestEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/test',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    // 接收响应数据
    res.on('data', (chunk) => {
      data += chunk;
    });

    // 响应结束处理
    res.on('end', () => {
      console.log('测试结果:');
      console.log(`状态码: ${res.statusCode}`);
      console.log(`响应头: ${JSON.stringify(res.headers)}`);
      console.log(`响应体: ${data}`);

      try {
        const jsonData = JSON.parse(data);
        if (jsonData.result === 'test') {
          console.log('✅ 测试通过: /test接口返回了正确的响应');
        } else {
          console.log('❌ 测试失败: /test接口返回了不正确的响应');
        }
      } catch (error) {
        console.log('❌ 测试失败: 响应不是有效的JSON格式');
      }
    });
  });

  // 处理请求错误
  req.on('error', (error) => {
    console.error('❌ 测试失败: 无法连接到服务器');
    console.error(`错误信息: ${error.message}`);
  });

  req.end();
}

// 运行测试
console.log('开始测试后端接口...');
testTestEndpoint();
