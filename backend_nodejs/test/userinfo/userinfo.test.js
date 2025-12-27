const http = require('http');

// 测试单个用户查询接口（GET /api/userinfo/:username）
function testSingleUserQuery(username) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/userinfo/${encodeURIComponent(username)}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`=== 单个用户查询接口测试结果 (username: ${username}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          if (res.statusCode === 200 && jsonData.message && jsonData.data && jsonData.data[username]) {
            const userData = jsonData.data[username];
            if (!userData.userid) {
              console.log(`✅ 单个用户查询测试通过 (username: ${username}): 正确返回用户信息且不包含userid`);
              resolve(userData);
            } else {
              console.log(`❌ 单个用户查询测试失败 (username: ${username}): 返回了userid字段`);
              reject(new Error(`Get single user failed for username ${username}: contains userid`));
            }
          } else if (res.statusCode === 404) {
            console.log(`✅ 单个用户查询测试通过 (username: ${username}): 正确返回404状态码（用户不存在）`);
            resolve(null); // 用户不存在也视为测试通过
          } else {
            console.log(`❌ 单个用户查询测试失败 (username: ${username}): 响应格式不正确`);
            reject(new Error(`Get single user failed for username ${username}`));
          }
        } catch (error) {
          console.log(`❌ 单个用户查询测试失败 (username: ${username}): 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 单个用户查询测试失败 (username: ${username}): 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 测试多个用户查询接口（POST /api/userinfo）
function testMultipleUsersQuery(usernames) {
  const postData = JSON.stringify({ usernames });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/userinfo',
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
        console.log(`=== 多个用户查询接口测试结果 (usernames: ${usernames.join(',')}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          if (res.statusCode === 200 && jsonData.message && jsonData.data) {
            // 检查每个用户是否以用户名作为key返回
            const foundUsers = Object.keys(jsonData.data);
            const notFoundUsers = jsonData.notFound || [];
            
            console.log(`✅ 多个用户查询测试通过: 返回了${foundUsers.length}个用户，未找到${notFoundUsers.length}个用户`);
            
            // 检查是否包含userid字段
            let hasUserId = false;
            for (const username in jsonData.data) {
              if (jsonData.data[username].userid) {
                hasUserId = true;
                break;
              }
            }
            
            if (hasUserId) {
              console.log(`❌ 多个用户查询测试失败: 返回了userid字段`);
              reject(new Error('Multiple users query failed: contains userid'));
            } else {
              console.log(`✅ 多个用户查询测试通过: 不包含userid字段`);
              resolve({ foundUsers, notFoundUsers });
            }
          } else {
            console.log('❌ 多个用户查询测试失败: 响应格式不正确');
            reject(new Error('Multiple users query failed'));
          }
        } catch (error) {
          console.log('❌ 多个用户查询测试失败: 响应不是有效的JSON格式');
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ 多个用户查询测试失败: 请求发送失败');
      console.error('错误信息:', error);
      reject(error);
    });

    // 发送请求体
    req.write(postData);
    req.end();
  });
}

// 测试无效请求（POST /api/userinfo）
function testInvalidRequest() {
  const postData = JSON.stringify({ usernames: [] });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/userinfo',
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
        console.log(`=== 无效请求测试结果 ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          if (res.statusCode === 400) {
            console.log(`✅ 无效请求测试通过: 正确返回400状态码`);
            resolve();
          } else {
            console.log(`❌ 无效请求测试失败: 未返回400状态码`);
            reject(new Error('Invalid request test failed'));
          }
        } catch (error) {
          console.log(`❌ 无效请求测试失败: 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 无效请求测试失败: 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 执行所有测试
async function runTests() {
  console.log('🚀 开始测试用户信息接口...\n');
  
  try {
    // 测试1: 单个用户查询（存在的用户）
    await testSingleUserQuery('test');
    console.log('\n');
    
    // 测试2: 单个用户查询（包含逗号的用户名）
    await testSingleUserQuery('user,name');
    console.log('\n');
    
    // 测试3: 单个用户查询（不存在的用户）
    await testSingleUserQuery('nonexistent_user_123');
    console.log('\n');
    
    // 测试4: 多个用户查询（包含存在和不存在的用户）
    await testMultipleUsersQuery(['test', 'user,name', 'nonexistent_1', 'nonexistent_2']);
    console.log('\n');
    
    // 测试5: 多个用户查询（只包含存在的用户）
    await testMultipleUsersQuery(['test', 'user,name']);
    console.log('\n');
    
    // 测试6: 无效请求（空用户名数组）
    await testInvalidRequest();
    console.log('\n');
    
    console.log('🎉 所有用户信息接口测试完成！');
  } catch (error) {
    console.log('\n❌ 测试过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 当直接运行此文件时执行测试
if (require.main === module) {
  runTests();
}

// 导出测试函数，供其他测试文件使用
module.exports = {
  testSingleUserQuery,
  testMultipleUsersQuery,
  testInvalidRequest,
  runTests
};
