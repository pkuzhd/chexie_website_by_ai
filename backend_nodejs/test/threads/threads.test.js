const http = require('http');

// 测试通过bid和tid获取单个主题帖信息接口
function testThreadsDetailEndpoint(bid, tid, expectExists = true) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/threads/${bid}/${tid}`,
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
        console.log(`=== 通过bid和tid获取主题帖信息接口测试结果 (bid: ${bid}, tid: ${tid}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          // 检查参数是否为有效的整数
          const isValidBid = !isNaN(parseInt(bid));
          const isValidTid = !isNaN(parseInt(tid));
          
          // 如果参数不是有效的整数，应该返回400状态码
          if (!isValidBid || !isValidTid) {
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
function testThreadsListEndpoint(bid, p = 1, p_size = 10, expectContent = true) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/threads?bid=${bid}&p=${p}&p_size=${p_size}`,
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
        console.log(`=== 通过bid获取分页主题帖信息接口测试结果 (bid: ${bid}, p: ${p}, p_size: ${p_size}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          if (res.statusCode === 200 && jsonData.message && jsonData.data) {
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
    // 测试场景1: 指定bid和tid访问
    console.log('=== 测试场景1: 指定bid和tid访问 ===');
    // 测试存在的主题帖 (bid=1, tid=4)
    await testThreadsDetailEndpoint(1, 4, true);
    console.log('\n');
    // 测试存在的主题帖 (bid=1, tid=5)
    await testThreadsDetailEndpoint(1, 5, true);
    console.log('\n');
    // 测试不存在的主题帖 (bid=1, tid=999)
    await testThreadsDetailEndpoint(1, 999, false);
    console.log('\n');
    // 测试不存在的主题帖 (bid=999, tid=1)
    await testThreadsDetailEndpoint(999, 1, false);
    console.log('\n');
    // 测试bid不是合法整数的情况 (bid='abc', tid=4)
    await testThreadsDetailEndpoint('abc', 4, false);
    console.log('\n');
    // 测试tid不是合法整数的情况 (bid=1, tid='xyz')
    await testThreadsDetailEndpoint(1, 'xyz', false);
    console.log('\n');
    // 测试bid和tid都不是合法整数的情况 (bid='abc', tid='xyz')
    await testThreadsDetailEndpoint('abc', 'xyz', false);
    console.log('\n');
    
    // 测试场景2: 指定bid，p_size和p访问
    console.log('=== 测试场景2: 指定bid，p_size和p访问 ===');
    // 测试有内容的情况 (bid=1, p=1, p_size=10)
    await testThreadsListEndpoint(1, 1, 10, true);
    console.log('\n');
    // 测试无内容的情况 (bid=1, p=100, p_size=10)
    await testThreadsListEndpoint(1, 100, 10, false);
    console.log('\n');
    
    // 测试场景3: 缺少参数的访问
    console.log('=== 测试场景3: 缺少参数的访问 ===');
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
  testThreadsDetailEndpoint,
  testThreadsListEndpoint,
  testThreadsMissingParams,
  runTests
};