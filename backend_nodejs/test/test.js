// 导入各个测试模块
const { runAllAuthTests } = require('./auth/auth.test');
const { runTests: runBoardinfoTests } = require('./boardinfo/boardinfo.test');
const { runTests: runUserinfoTests } = require('./userinfo/userinfo.test');
const { runTests: runThreadsTests } = require('./threads/threads.test');

// 测试/test接口
async function testTestEndpoint() {
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/test',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      // 接收响应数据
      res.on('data', (chunk) => {
        data += chunk;
      });

      // 响应结束处理
      res.on('end', () => {
        console.log('=== /test接口测试结果 ===');
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应体: ${data}`);

        try {
          const jsonData = JSON.parse(data);
          if (jsonData.result === 'test') {
            console.log('✅ 测试通过: /test接口返回了正确的响应');
            resolve();
          } else {
            console.log('❌ 测试失败: /test接口返回了不正确的响应');
            resolve(); // 不中断整个测试流程
          }
        } catch (error) {
          console.log('❌ 测试失败: 响应不是有效的JSON格式');
          resolve(); // 不中断整个测试流程
        }
      });
    });

    // 处理请求错误
    req.on('error', (error) => {
      console.error('❌ 测试失败: 无法连接到服务器');
      console.error(`错误信息: ${error.message}`);
      resolve(); // 不中断整个测试流程
    });

    req.end();
  });
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行所有后端接口测试...\n');
  
  try {
    // 运行各个测试模块
    await testTestEndpoint();
    console.log('\n' + '='.repeat(50) + '\n');
    await runBoardinfoTests();
    console.log('\n' + '='.repeat(50) + '\n');
    await runUserinfoTests();
    console.log('\n' + '='.repeat(50) + '\n');
    await runThreadsTests();
    console.log('\n' + '='.repeat(50) + '\n');
    await runAllAuthTests();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 所有后端接口测试完成！');
    console.log('='.repeat(50));
  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ 测试过程中出现错误:', error.message);
    console.log('='.repeat(50));
    process.exit(1);
  }
}

// 当直接运行此文件时执行所有测试
if (require.main === module) {
  runAllTests();
}

// 导出主测试函数
module.exports = {
  runAllTests
};
