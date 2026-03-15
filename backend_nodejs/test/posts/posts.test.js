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

// 测试通过查询参数获取帖子列表或单个楼层信息接口
function testPostsQueryEndpoint(bid, tid, p = 1, p_size = 12, pid = null, expectExists = true, withAuth = false) {
  let path = `/api/posts?bid=${bid}&tid=${tid}`;
  
  if (p !== null) path += `&p=${p}`;
  if (p_size !== null) path += `&p_size=${p_size}`;
  if (pid !== null) path += `&pid=${pid}`;
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
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
        const testType = pid !== null ? `获取单个楼层信息` : `获取帖子列表`;
        console.log(`=== 通过查询参数${testType}接口测试结果 (bid: ${bid}, tid: ${tid}, pid: ${pid}, p: ${p}, p_size: ${p_size}, auth: ${withAuth ? 'yes' : 'no'}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          // 检查参数是否为有效的整数
          const isValidBid = !isNaN(parseInt(bid));
          const isValidTid = !isNaN(parseInt(tid));
          const isValidPid = pid === null || !isNaN(parseInt(pid));
          
          // 检查是否需要认证（bid=1）
          const requiresAuth = parseInt(bid) === 1;
          
          // 如果需要认证且未提供认证
          if (requiresAuth && !withAuth) {
            if (res.statusCode === 401 && jsonData.message) {
              console.log(`✅ ${testType}测试通过: 未登录状态下正确返回401状态码`);
              resolve(null);
            } else {
              console.log(`❌ ${testType}测试失败: 未登录状态下应该返回401状态码`);
              reject(new Error(`Should return 401 for bid=1 without authentication`));
            }
          } else if (!isValidBid || !isValidTid || !isValidPid) {
            // 如果参数不是有效的整数，应该返回400状态码
            if (res.statusCode === 400 && jsonData.message) {
              console.log(`✅ ${testType}测试通过: 正确返回400状态码和参数错误信息`);
              resolve(null);
            } else {
              console.log(`❌ ${testType}测试失败: 应该返回400状态码和参数错误信息`);
              reject(new Error(`Should return 400 for invalid parameters`));
            }
          } else if (pid !== null) {
            // 获取单个楼层信息
            if (expectExists) {
              if (res.statusCode === 200 && jsonData.message && jsonData.data) {
                console.log(`✅ 通过查询参数获取单个楼层信息测试通过`);
                resolve(jsonData.data);
              } else {
                console.log(`❌ 通过查询参数获取单个楼层信息测试失败: 响应格式不正确或数据不匹配`);
                reject(new Error(`Get post by query params failed for bid ${bid}, tid ${tid}, pid ${pid}`));
              }
            } else {
              // 参数有效，但不存在
              if (res.statusCode === 404 && jsonData.message) {
                console.log(`✅ 通过查询参数获取不存在的楼层信息测试通过: 正确返回404状态码`);
                resolve(null);
              } else {
                console.log(`❌ 通过查询参数获取不存在的楼层信息测试失败: 应该返回404状态码`);
                reject(new Error(`Should return 404 for non-existent post`));
              }
            }
          } else {
            // 获取帖子列表
            if (res.statusCode === 200 && jsonData.message && jsonData.data && 
                jsonData.data.posts && Array.isArray(jsonData.data.posts) &&
                jsonData.data.pagination) {
              console.log(`✅ 通过查询参数获取帖子列表测试通过`);
              console.log(`获取到的帖子数量: ${jsonData.data.posts.length}`);
              resolve(jsonData.data.posts);
            } else {
              console.log(`❌ 通过查询参数获取帖子列表测试失败: 响应格式不正确`);
              reject(new Error(`Get posts list failed for bid ${bid}, tid ${tid}`));
            }
          }
        } catch (error) {
          console.log(`❌ ${testType}测试失败: 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${pid !== null ? '获取单个楼层信息' : '获取帖子列表'}测试失败: 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 测试通过路径参数获取单个楼层信息接口
function testPostsPathEndpoint(bid, tid, pid, expectExists = true, withAuth = false) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/posts/${bid}/${tid}/${pid}`,
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
        console.log(`=== 通过路径参数获取单个楼层信息接口测试结果 (bid: ${bid}, tid: ${tid}, pid: ${pid}, auth: ${withAuth ? 'yes' : 'no'}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          // 检查参数是否为有效的整数
          const isValidBid = !isNaN(parseInt(bid));
          const isValidTid = !isNaN(parseInt(tid));
          const isValidPid = !isNaN(parseInt(pid));
          
          // 检查是否需要认证（bid=1）
          const requiresAuth = parseInt(bid) === 1;
          
          // 如果需要认证且未提供认证
          if (requiresAuth && !withAuth) {
            if (res.statusCode === 401 && jsonData.message) {
              console.log(`✅ 通过路径参数获取单个楼层信息测试通过: 未登录状态下正确返回401状态码`);
              resolve(null);
            } else {
              console.log(`❌ 通过路径参数获取单个楼层信息测试失败: 未登录状态下应该返回401状态码`);
              reject(new Error(`Should return 401 for bid=1 without authentication`));
            }
          } else if (!isValidBid || !isValidTid || !isValidPid) {
            // 如果参数不是有效的整数，应该返回400状态码
            if (res.statusCode === 400 && jsonData.message) {
              console.log(`✅ 通过路径参数获取单个楼层信息测试通过: 正确返回400状态码和参数错误信息`);
              resolve(null);
            } else {
              console.log(`❌ 通过路径参数获取单个楼层信息测试失败: 应该返回400状态码和参数错误信息`);
              reject(new Error(`Should return 400 for invalid parameters`));
            }
          } else if (expectExists) {
            // 参数有效，检查是否存在
            if (res.statusCode === 200 && jsonData.message && jsonData.data) {
              console.log(`✅ 通过路径参数获取单个楼层信息测试通过`);
              resolve(jsonData.data);
            } else {
              console.log(`❌ 通过路径参数获取单个楼层信息测试失败: 响应格式不正确或数据不匹配`);
              reject(new Error(`Get post by path params failed for bid ${bid}, tid ${tid}, pid ${pid}`));
            }
          } else {
            // 参数有效，但不存在
            if (res.statusCode === 404 && jsonData.message) {
              console.log(`✅ 通过路径参数获取不存在的楼层信息测试通过: 正确返回404状态码`);
              resolve(null);
            } else {
              console.log(`❌ 通过路径参数获取不存在的楼层信息测试失败: 应该返回404状态码`);
              reject(new Error(`Should return 404 for non-existent post`));
            }
          }
        } catch (error) {
          console.log(`❌ 通过路径参数获取单个楼层信息测试失败: 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 通过路径参数获取单个楼层信息测试失败: 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 测试通过fid获取单个楼层信息接口
function testPostsFidEndpoint(fid, expectExists = true) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/posts/${fid}`,
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
        console.log(`=== 通过fid获取单个楼层信息接口测试结果 (fid: ${fid}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          // 检查参数是否为有效的整数
          const isValidFid = !isNaN(parseInt(fid));
          
          // 如果参数不是有效的整数，应该返回400状态码
          if (!isValidFid) {
            if (res.statusCode === 400 && jsonData.message) {
              console.log(`✅ 通过fid获取单个楼层信息测试通过: 正确返回400状态码和参数错误信息`);
              resolve(null);
            } else {
              console.log(`❌ 通过fid获取单个楼层信息测试失败: 应该返回400状态码和参数错误信息`);
              reject(new Error(`Should return 400 for invalid fid`));
            }
          } else if (expectExists) {
            // 参数有效，检查是否存在
            if (res.statusCode === 200 && jsonData.message && jsonData.data) {
              console.log(`✅ 通过fid获取单个楼层信息测试通过`);
              resolve(jsonData.data);
            } else {
              console.log(`❌ 通过fid获取单个楼层信息测试失败: 响应格式不正确或数据不匹配`);
              reject(new Error(`Get post by fid failed for fid ${fid}`));
            }
          } else {
            // 参数有效，但不存在
            if (res.statusCode === 404 && jsonData.message) {
              console.log(`✅ 通过fid获取不存在的楼层信息测试通过: 正确返回404状态码`);
              resolve(null);
            } else {
              console.log(`❌ 通过fid获取不存在的楼层信息测试失败: 应该返回404状态码`);
              reject(new Error(`Should return 404 for non-existent post`));
            }
          }
        } catch (error) {
          console.log(`❌ 通过fid获取单个楼层信息测试失败: 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 通过fid获取单个楼层信息测试失败: 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 测试缺少必填参数的访问接口
function testPostsMissingParams() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/posts`, // 缺少bid和tid参数
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
        console.log(`=== 缺少必填参数的访问接口测试结果 ===`);
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
  console.log('🚀 开始测试帖子信息接口...\n');
  
  try {
    // 测试场景1: 登录功能测试
    console.log('=== 测试场景1: 登录功能测试 ===');
    await testLoginEndpoint();
    console.log('\n');
    
    // 测试场景2: 未登录状态下访问bid=1接口（应该返回401）
    console.log('=== 测试场景2: 未登录状态下访问bid=1接口 ===');
    // 测试查询参数接口 - 帖子列表（未登录）
    await testPostsQueryEndpoint(1, 4, 1, 12, null, true, false);
    console.log('\n');
    // 测试查询参数接口 - 单个楼层（未登录）
    await testPostsQueryEndpoint(1, 4, null, null, 1, true, false);
    console.log('\n');
    // 测试路径参数接口（未登录）
    await testPostsPathEndpoint(1, 4, 1, true, false);
    console.log('\n');
    
    // 测试场景3: 登录状态下访问bid=1接口（应该返回200）
    console.log('=== 测试场景3: 登录状态下访问bid=1接口 ===');
    // 测试查询参数接口 - 帖子列表（已登录）
    await testPostsQueryEndpoint(1, 4, 1, 12, null, true, true);
    console.log('\n');
    // 测试查询参数接口 - 单个楼层（已登录）
    await testPostsQueryEndpoint(1, 4, null, null, 1, true, true);
    console.log('\n');
    // 测试查询参数接口 - 不存在的楼层（已登录）
    await testPostsQueryEndpoint(1, 4, null, null, 999, false, true);
    console.log('\n');
    // 测试路径参数接口（已登录）
    await testPostsPathEndpoint(1, 4, 1, true, true);
    console.log('\n');
    // 测试路径参数接口 - 不存在的楼层（已登录）
    await testPostsPathEndpoint(1, 4, 999, false, true);
    console.log('\n');
    
    // 测试场景4: 非bid=1接口（不需要认证）
    console.log('=== 测试场景4: 非bid=1接口测试 ===');
    // 测试查询参数接口
    await testPostsQueryEndpoint(999, 1, 1, 12, null, false, false);
    console.log('\n');
    // 测试路径参数接口
    await testPostsPathEndpoint(999, 1, 1, false, false);
    console.log('\n');
    
    // 测试场景5: 通过fid获取单个楼层（不需要认证）
    console.log('=== 测试场景5: 通过fid获取单个楼层 ===');
    // 测试存在的楼层 (fid=999)
    await testPostsFidEndpoint(999, true);
    console.log('\n');
    // 测试不存在的楼层 (fid=999999)
    await testPostsFidEndpoint(999999, false);
    console.log('\n');
    
    // 测试场景6: 参数错误情况
    console.log('=== 测试场景6: 参数错误情况 ===');
    // 测试参数格式错误 - 查询参数
    await testPostsQueryEndpoint('abc', 'xyz', null, null, null, false, false);
    console.log('\n');
    // 测试参数格式错误 - 路径参数
    await testPostsPathEndpoint('abc', 'xyz', '123', false, false);
    console.log('\n');
    // 测试参数格式错误 - fid
    await testPostsFidEndpoint('abc', false);
    console.log('\n');
    
    // 测试场景7: 缺少参数
    console.log('=== 测试场景7: 缺少参数 ===');
    await testPostsMissingParams();
    console.log('\n');
    
    console.log('🎉 所有帖子信息接口测试完成！');
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
  testPostsQueryEndpoint,
  testPostsPathEndpoint,
  testPostsFidEndpoint,
  testPostsMissingParams,
  runTests
};