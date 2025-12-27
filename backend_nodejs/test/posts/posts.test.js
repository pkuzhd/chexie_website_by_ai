const http = require('http');

// 测试通过查询参数获取帖子列表或单个楼层信息接口
function testPostsQueryEndpoint(bid, tid, p = 1, p_size = 12, pid = null, expectExists = true) {
  let path = `/api/posts?bid=${bid}&tid=${tid}`;
  
  if (p !== null) path += `&p=${p}`;
  if (p_size !== null) path += `&p_size=${p_size}`;
  if (pid !== null) path += `&pid=${pid}`;
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
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
        const testType = pid !== null ? `获取单个楼层信息` : `获取帖子列表`;
        console.log(`=== 通过查询参数${testType}接口测试结果 (bid: ${bid}, tid: ${tid}, pid: ${pid}, p: ${p}, p_size: ${p_size}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          // 检查参数是否为有效的整数
          const isValidBid = !isNaN(parseInt(bid));
          const isValidTid = !isNaN(parseInt(tid));
          const isValidPid = pid === null || !isNaN(parseInt(pid));
          
          // 如果参数不是有效的整数，应该返回400状态码
          if (!isValidBid || !isValidTid || !isValidPid) {
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
function testPostsPathEndpoint(bid, tid, pid, expectExists = true) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/posts/${bid}/${tid}/${pid}`,
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
        console.log(`=== 通过路径参数获取单个楼层信息接口测试结果 (bid: ${bid}, tid: ${tid}, pid: ${pid}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          // 检查参数是否为有效的整数
          const isValidBid = !isNaN(parseInt(bid));
          const isValidTid = !isNaN(parseInt(tid));
          const isValidPid = !isNaN(parseInt(pid));
          
          // 如果参数不是有效的整数，应该返回400状态码
          if (!isValidBid || !isValidTid || !isValidPid) {
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
    // 测试场景1: 查询参数版本 - 帖子列表
    console.log('=== 测试场景1: 查询参数版本 - 帖子列表 ===');
    // 测试有内容的情况 (bid=1, tid=4, p=1, p_size=12)
    await testPostsQueryEndpoint(1, 4, 1, 12, null, true);
    console.log('\n');
    // 测试无内容的情况 (bid=1, tid=999, p=1, p_size=12)
    await testPostsQueryEndpoint(1, 999, 1, 12, null, false);
    console.log('\n');
    // 测试默认参数 (bid=1, tid=4)
    await testPostsQueryEndpoint(1, 4, null, null, null, true);
    console.log('\n');
    
    // 测试场景2: 查询参数版本 - 单个楼层
    console.log('=== 测试场景2: 查询参数版本 - 单个楼层 ===');
    // 测试存在的楼层 (bid=1, tid=4, pid=1)
    await testPostsQueryEndpoint(1, 4, null, null, 1, true);
    console.log('\n');
    // 测试不存在的楼层 (bid=1, tid=4, pid=999)
    await testPostsQueryEndpoint(1, 4, null, null, 999, false);
    console.log('\n');
    
    // 测试场景3: 路径参数版本 - 单个楼层
    console.log('=== 测试场景3: 路径参数版本 - 单个楼层 ===');
    // 测试存在的楼层 (bid=1, tid=4, pid=1)
    await testPostsPathEndpoint(1, 4, 1, true);
    console.log('\n');
    // 测试不存在的楼层 (bid=1, tid=4, pid=999)
    await testPostsPathEndpoint(1, 4, 999, false);
    console.log('\n');
    
    // 测试场景4: 通过fid获取单个楼层
    console.log('=== 测试场景4: 通过fid获取单个楼层 ===');
    // 测试存在的楼层 (fid=597870)
    await testPostsFidEndpoint(597870, true);
    console.log('\n');
    // 测试不存在的楼层 (fid=999)
    await testPostsFidEndpoint(999, false);
    console.log('\n');
    // 测试另一个存在的楼层 (fid=597872)
    await testPostsFidEndpoint(597872, true);
    console.log('\n');
    // 测试另一个存在的楼层 (fid=597873)
    await testPostsFidEndpoint(597873, true);
    console.log('\n');
    
    // 测试场景5: 参数错误情况
    console.log('=== 测试场景5: 参数错误情况 ===');
    // 测试参数格式错误 - 查询参数
    await testPostsQueryEndpoint('abc', 'xyz', null, null, null, false);
    console.log('\n');
    // 测试参数格式错误 - 路径参数
    await testPostsPathEndpoint('abc', 'xyz', '123', false);
    console.log('\n');
    // 测试参数格式错误 - fid
    await testPostsFidEndpoint('abc', false);
    console.log('\n');
    
    // 测试场景6: 缺少参数
    console.log('=== 测试场景6: 缺少参数 ===');
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
  testPostsQueryEndpoint,
  testPostsPathEndpoint,
  testPostsFidEndpoint,
  testPostsMissingParams,
  runTests
};