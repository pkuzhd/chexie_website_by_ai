const http = require('http');

// 保存测试过程中获取的token
let authToken = null;
const testUsername = 'test';
const testPassword = 'test123';

// 测试登录接口，获取认证令牌
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
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200 && jsonData.token) {
            authToken = jsonData.token;
            console.log('✅ 登录成功: 获取到认证令牌');
            resolve();
          } else {
            console.log('❌ 登录失败: 未获取到有效token');
            reject(new Error('Login failed'));
          }
        } catch (error) {
          console.log('❌ 登录失败: 响应不是有效的JSON格式');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 登录失败: 无法连接到服务器');
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 构建请求头，包含认证令牌
function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

// 测试通过查询参数获取单个主题帖信息接口
function testThreadsDetailQueryEndpoint(bid, tid, expectExists = true, withAuth = false) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/threads?bid=${bid}&tid=${tid}`,
    method: 'GET',
    headers: buildHeaders()
  };

  if (!withAuth) {
    delete options.headers['Authorization'];
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`=== 通过查询参数获取主题帖信息接口测试结果 (bid: ${bid}, tid: ${tid}, auth: ${withAuth ? 'yes' : 'no'}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          // 检查参数是否为有效的整数
          const isValidBid = !isNaN(parseInt(bid));
          const isValidTid = !isNaN(parseInt(tid));
          
          // 检查是否需要认证（bid=1）
          const requiresAuth = parseInt(bid) === 1;
          
          // 如果需要认证且未提供认证
          if (requiresAuth && !withAuth) {
            if (res.statusCode === 401 && jsonData.message) {
              console.log(`✅ 获取主题帖信息测试通过: 未登录状态下正确返回401状态码`);
              resolve(null);
            } else {
              console.log(`❌ 获取主题帖信息测试失败: 未登录状态下应该返回401状态码`);
              reject(new Error(`Should return 401 for bid=1 without authentication`));
            }
          } else if (!isValidBid || !isValidTid) {
            // 如果参数不是有效的整数，应该返回400状态码
            if (res.statusCode === 400 && jsonData.message) {
              console.log(`✅ 获取主题帖信息测试通过: 正确返回400状态码和参数错误信息`);
              resolve(null);
            } else {
              console.log(`❌ 获取主题帖信息测试失败: 应该返回400状态码和参数错误信息`);
              reject(new Error(`Should return 400 for invalid parameters`));
            }
          } else if (expectExists) {
            // 参数有效，检查是否存在
            if (res.statusCode === 200 && jsonData.message && jsonData.data && 
                jsonData.data.bid === parseInt(bid) && jsonData.data.tid === parseInt(tid)) {
              console.log(`✅ 获取主题帖信息测试通过`);
              resolve(jsonData.data);
            } else {
              console.log(`❌ 获取主题帖信息测试失败: 响应格式不正确或数据不匹配`);
              reject(new Error(`Get threads detail failed for bid ${bid}, tid ${tid}`));
            }
          } else {
            // 参数有效，但不存在
            if (res.statusCode === 404 && jsonData.message) {
              console.log(`✅ 获取不存在的主题帖信息测试通过: 正确返回404状态码`);
              resolve(null);
            } else {
              console.log(`❌ 获取不存在的主题帖信息测试失败: 应该返回404状态码`);
              reject(new Error(`Should return 404 for non-existent thread`));
            }
          }
        } catch (error) {
          console.log(`❌ 获取主题帖信息测试失败: 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 获取主题帖信息测试失败: 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 测试通过路径参数获取单个主题帖信息接口
function testThreadsDetailPathEndpoint(bid, tid, expectExists = true, withAuth = false) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/threads/${bid}/${tid}`,
    method: 'GET',
    headers: buildHeaders()
  };

  if (!withAuth) {
    delete options.headers['Authorization'];
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`=== 通过bid和tid获取主题帖信息接口测试结果 (bid: ${bid}, tid: ${tid}, auth: ${withAuth ? 'yes' : 'no'}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          // 检查参数是否为有效的整数
          const isValidBid = !isNaN(parseInt(bid));
          const isValidTid = !isNaN(parseInt(tid));
          
          // 检查是否需要认证（bid=1）
          const requiresAuth = parseInt(bid) === 1;
          
          // 如果需要认证且未提供认证
          if (requiresAuth && !withAuth) {
            if (res.statusCode === 401 && jsonData.message) {
              console.log(`✅ 获取主题帖信息测试通过: 未登录状态下正确返回401状态码`);
              resolve(null);
            } else {
              console.log(`❌ 获取主题帖信息测试失败: 未登录状态下应该返回401状态码`);
              reject(new Error(`Should return 401 for bid=1 without authentication`));
            }
          } else if (!isValidBid || !isValidTid) {
            // 如果参数不是有效的整数，应该返回400状态码
            if (res.statusCode === 400 && jsonData.message) {
              console.log(`✅ 获取主题帖信息测试通过: 正确返回400状态码和参数错误信息`);
              resolve(null);
            } else {
              console.log(`❌ 获取主题帖信息测试失败: 应该返回400状态码和参数错误信息`);
              reject(new Error(`Should return 400 for invalid parameters`));
            }
          } else if (expectExists) {
            // 参数有效，检查是否存在
            if (res.statusCode === 200 && jsonData.message && jsonData.data && 
                jsonData.data.bid === parseInt(bid) && jsonData.data.tid === parseInt(tid)) {
              console.log(`✅ 获取主题帖信息测试通过`);
              resolve(jsonData.data);
            } else {
              console.log(`❌ 获取主题帖信息测试失败: 响应格式不正确或数据不匹配`);
              reject(new Error(`Get threads detail failed for bid ${bid}, tid ${tid}`));
            }
          } else {
            // 参数有效，但不存在
            if (res.statusCode === 404 && jsonData.message) {
              console.log(`✅ 获取不存在的主题帖信息测试通过: 正确返回404状态码`);
              resolve(null);
            } else {
              console.log(`❌ 获取不存在的主题帖信息测试失败: 应该返回404状态码`);
              reject(new Error(`Should return 404 for non-existent thread`));
            }
          }
        } catch (error) {
          console.log(`❌ 获取主题帖信息测试失败: 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 获取主题帖信息测试失败: 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 测试通过bid获取分页主题帖信息接口
function testThreadsListEndpoint(bid, p = 1, p_size = 10, expectContent = true, withAuth = false) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/threads?bid=${bid}&p=${p}&p_size=${p_size}`,
    method: 'GET',
    headers: buildHeaders()
  };

  if (!withAuth) {
    delete options.headers['Authorization'];
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`=== 通过bid获取分页主题帖信息接口测试结果 (bid: ${bid}, p: ${p}, p_size: ${p_size}, auth: ${withAuth ? 'yes' : 'no'}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          // 检查是否需要认证（bid=1）
          const requiresAuth = parseInt(bid) === 1;
          
          // 如果需要认证且未提供认证
          if (requiresAuth && !withAuth) {
            if (res.statusCode === 401 && jsonData.message) {
              console.log(`✅ 获取分页主题帖信息测试通过: 未登录状态下正确返回401状态码`);
              resolve(null);
            } else {
              console.log(`❌ 获取分页主题帖信息测试失败: 未登录状态下应该返回401状态码`);
              reject(new Error(`Should return 401 for bid=1 without authentication`));
            }
          } else if (res.statusCode === 200 && jsonData.message && jsonData.data) {
            const hasThreads = jsonData.data.threads && Array.isArray(jsonData.data.threads);
            
            if (expectContent) {
              if (hasThreads && jsonData.data.threads.length > 0) {
                console.log(`✅ 获取分页主题帖信息测试通过: 返回了内容`);
                console.log(`获取到的主题帖数量: ${jsonData.data.threads.length}`);
                resolve(jsonData.data.threads);
              } else {
                console.log(`❌ 获取分页主题帖信息测试失败: 期望返回内容但实际没有内容`);
                reject(new Error(`Should return threads content`));
              }
            } else {
              if (hasThreads && jsonData.data.threads.length === 0) {
                console.log(`✅ 获取分页主题帖信息测试通过: 正确返回空内容`);
                resolve([]);
              } else {
                console.log(`❌ 获取分页主题帖信息测试失败: 期望返回空内容但实际有内容`);
                reject(new Error(`Should return empty threads`));
              }
            }
          } else {
            console.log(`❌ 获取分页主题帖信息测试失败: 响应格式不正确`);
            reject(new Error(`Get threads list failed for bid ${bid}`));
          }
        } catch (error) {
          console.log(`❌ 获取分页主题帖信息测试失败: 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 获取分页主题帖信息测试失败: 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 测试缺少参数的访问接口
function testThreadsMissingParams() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/threads`, // 缺少bid参数
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
        console.log(`=== 缺少参数的访问接口测试结果 ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          if (res.statusCode === 400 && jsonData.message) {
            console.log(`✅ 缺少参数的访问测试通过: 正确返回400状态码和错误信息`);
            resolve();
          } else {
            console.log(`❌ 缺少参数的访问测试失败: 应该返回400状态码`);
            reject(new Error(`Should return 400 for missing parameters`));
          }
        } catch (error) {
          console.log(`❌ 缺少参数的访问测试失败: 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 缺少参数的访问测试失败: 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 执行所有测试
async function runTests() {
  console.log('🚀 开始测试主题帖信息接口...\n');
  
  try {
    // 测试场景1: 登录功能测试
    console.log('=== 测试场景1: 登录功能测试 ===');
    await testLoginEndpoint();
    console.log('\n');
    
    // 测试场景2: 未登录状态下访问bid=1接口（应该返回401）
    console.log('=== 测试场景2: 未登录状态下访问bid=1接口 ===');
    // 测试查询参数接口（未登录）
    await testThreadsDetailQueryEndpoint(1, 4, true, false);
    console.log('\n');
    // 测试路径参数接口（未登录）
    await testThreadsDetailPathEndpoint(1, 4, true, false);
    console.log('\n');
    // 测试分页列表接口（未登录）
    await testThreadsListEndpoint(1, 1, 10, true, false);
    console.log('\n');
    
    // 测试场景3: 登录状态下访问bid=1接口（应该返回200）
    console.log('=== 测试场景3: 登录状态下访问bid=1接口 ===');
    // 测试查询参数接口（已登录）
    await testThreadsDetailQueryEndpoint(1, 4, true, true);
    console.log('\n');
    await testThreadsDetailQueryEndpoint(1, 5, true, true);
    console.log('\n');
    await testThreadsDetailQueryEndpoint(1, 999999, false, true);
    console.log('\n');
    // 测试路径参数接口（已登录）
    await testThreadsDetailPathEndpoint(1, 4, true, true);
    console.log('\n');
    await testThreadsDetailPathEndpoint(1, 5, true, true);
    console.log('\n');
    await testThreadsDetailPathEndpoint(1, 999999, false, true);
    console.log('\n');
    // 测试分页列表接口（已登录）
    await testThreadsListEndpoint(1, 1, 10, true, true);
    console.log('\n');
    await testThreadsListEndpoint(1, 9999, 10, false, true);
    console.log('\n');
    
    // 测试场景4: 非bid=1接口（不需要认证）
    console.log('=== 测试场景4: 非bid=1接口测试 ===');
    // 测试查询参数接口
    await testThreadsDetailQueryEndpoint(999, 1, false, false);
    console.log('\n');
    // 测试路径参数接口
    await testThreadsDetailPathEndpoint(999, 1, false, false);
    console.log('\n');
    
    // 测试场景5: 参数验证测试
    console.log('=== 测试场景5: 参数验证测试 ===');
    // 测试bid不是合法整数的情况
    await testThreadsDetailQueryEndpoint('abc', 4, false, false);
    console.log('\n');
    // 测试tid不是合法整数的情况
    await testThreadsDetailQueryEndpoint(1, 'xyz', false, false);
    console.log('\n');
    // 测试bid和tid都不是合法整数的情况
    await testThreadsDetailQueryEndpoint('abc', 'xyz', false, false);
    console.log('\n');
    // 测试路径参数格式错误
    await testThreadsDetailPathEndpoint('abc', 4, false, false);
    console.log('\n');
    await testThreadsDetailPathEndpoint(1, 'xyz', false, false);
    console.log('\n');
    await testThreadsDetailPathEndpoint('abc', 'xyz', false, false);
    console.log('\n');
    
    // 测试场景6: 缺少参数的访问
    console.log('=== 测试场景6: 缺少参数的访问 ===');
    await testThreadsMissingParams();
    console.log('\n');
    
    console.log('🎉 所有主题帖信息接口测试完成！');
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
  testLoginEndpoint,
  testThreadsDetailQueryEndpoint,
  testThreadsDetailPathEndpoint,
  testThreadsListEndpoint,
  testThreadsMissingParams,
  runTests
};