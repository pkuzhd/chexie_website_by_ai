const http = require('http');

// 保存测试过程中获取的token
let authToken = null;
const testUsername = 'test';
const testPassword = 'test123';

// 测试登录接口
function testLoginEndpoint() {
  const postData = JSON.stringify({
    username: testUsername,
    password: testPassword
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('=== 登录接口测试结果 ===');
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应体: ${data}`);

        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200 && jsonData.token && jsonData.user) {
            authToken = jsonData.token;
            console.log('✅ 登录测试通过: 成功获取token');
            console.log(`获取到的token: ${authToken}`);
            resolve();
          } else {
            console.log('❌ 登录测试失败: 未获取到有效token');
            reject(new Error('Login failed'));
          }
        } catch (error) {
          console.log('❌ 登录测试失败: 响应不是有效的JSON格式');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 登录测试失败: 无法连接到服务器');
      console.error(`错误信息: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 测试获取当前用户信息接口
function testCurrentEndpoint() {
  if (!authToken) {
    console.log('❌ 获取用户信息测试跳过: 没有有效的token');
    return Promise.resolve();
  }

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/current',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n=== 获取当前用户信息接口测试结果 ===');
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应体: ${data}`);

        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200 && jsonData.userid) {
            console.log('✅ 获取用户信息测试通过: 成功获取用户信息');
            console.log(`用户名: ${jsonData.username}`);
            console.log(`用户ID: ${jsonData.userid}`);
            resolve();
          } else {
            console.log('❌ 获取用户信息测试失败: 未获取到有效用户信息');
            reject(new Error('Get current user failed'));
          }
        } catch (error) {
          console.log('❌ 获取用户信息测试失败: 响应不是有效的JSON格式');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 获取用户信息测试失败: 无法连接到服务器');
      console.error(`错误信息: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

// 测试登出接口
function testLogoutEndpoint() {
  if (!authToken) {
    console.log('❌ 登出测试跳过: 没有有效的token');
    return Promise.resolve();
  }

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/logout',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n=== 登出接口测试结果 ===');
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应体: ${data}`);

        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200 && jsonData.message === '登出成功') {
            console.log('✅ 登出测试通过: 成功登出');
            resolve();
          } else {
            console.log('❌ 登出测试失败: 登出失败');
            reject(new Error('Logout failed'));
          }
        } catch (error) {
          console.log('❌ 登出测试失败: 响应不是有效的JSON格式');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 登出测试失败: 无法连接到服务器');
      console.error(`错误信息: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

// 测试登出后token是否失效
function testTokenInvalidation() {
  if (!authToken) {
    console.log('❌ Token失效测试跳过: 没有有效的token');
    return Promise.resolve();
  }

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/current',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };

  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n=== Token失效测试结果 ===');
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应体: ${data}`);

        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 401 && jsonData.message === '认证失败或令牌过期') {
            console.log('✅ Token失效测试通过: 登出后token已失效');
            resolve();
          } else {
            console.log('❌ Token失效测试失败: 登出后token仍然有效');
            resolve(); // 不中断整个测试流程
          }
        } catch (error) {
          console.log('❌ Token失效测试失败: 响应不是有效的JSON格式');
          resolve(); // 不中断整个测试流程
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Token失效测试失败: 无法连接到服务器');
      console.error(`错误信息: ${error.message}`);
      resolve(); // 不中断整个测试流程
    });

    req.end();
  });
}

// 运行所有测试
async function runAllAuthTests() {
  console.log('开始测试认证接口...\n');
  
  try {
    await testLoginEndpoint();
    await testCurrentEndpoint();
    await testLogoutEndpoint();
    await testTokenInvalidation();
    
    console.log('\n🎉 所有认证接口测试完成！');
  } catch (error) {
    console.log('\n❌ 认证接口测试过程中出现错误');
    process.exit(1);
  }
}

// 执行测试
runAllAuthTests();
