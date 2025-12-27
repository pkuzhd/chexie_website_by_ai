const http = require('http');

// 测试获取所有板块信息接口
function testBoardinfoListEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/boardinfo',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('=== 获取所有板块信息接口测试结果 ===');
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          if (res.statusCode === 200 && jsonData.message && jsonData.data && Array.isArray(jsonData.data)) {
            console.log('✅ 获取所有板块信息测试通过');
            console.log(`获取到的板块数量: ${jsonData.data.length}`);
            resolve(jsonData.data); // 返回板块数据，供后续测试使用
          } else {
            console.log('❌ 获取所有板块信息测试失败: 响应格式不正确');
            reject(new Error('Get boardinfo list failed'));
          }
        } catch (error) {
          console.log('❌ 获取所有板块信息测试失败: 响应不是有效的JSON格式');
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ 获取所有板块信息测试失败: 请求发送失败');
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 测试获取单个板块信息接口
function testBoardinfoDetailEndpoint(bid) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/boardinfo/${bid}`,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`=== 获取单个板块信息接口测试结果 (bid: ${bid}) ===`);
        console.log(`状态码: ${res.statusCode}`);

        try {
          const jsonData = JSON.parse(data);
          console.log(`响应体: ${JSON.stringify(jsonData, null, 2)}`);
          
          if (res.statusCode === 200 && jsonData.message && jsonData.data && jsonData.data.bid === bid) {
            console.log(`✅ 获取单个板块信息测试通过 (bid: ${bid})`);
            resolve(jsonData.data);
          } else if (res.statusCode === 404) {
            console.log(`✅ 获取单个板块信息测试通过 (bid: ${bid}): 正确返回404状态码（板块不存在）`);
            resolve(null); // 板块不存在也视为测试通过，因为可能是有效测试用例
          } else {
            console.log(`❌ 获取单个板块信息测试失败 (bid: ${bid}): 响应格式不正确`);
            reject(new Error(`Get boardinfo detail failed for bid ${bid}`));
          }
        } catch (error) {
          console.log(`❌ 获取单个板块信息测试失败 (bid: ${bid}): 响应不是有效的JSON格式`);
          console.error('错误信息:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ 获取单个板块信息测试失败 (bid: ${bid}): 请求发送失败`);
      console.error('错误信息:', error);
      reject(error);
    });

    req.end();
  });
}

// 执行所有测试
async function runTests() {
  console.log('🚀 开始测试板块信息接口...\n');
  
  try {
    // 测试获取所有板块信息
    const boardinfoList = await testBoardinfoListEndpoint();
    console.log('\n');
    
    // 如果有板块数据，测试获取单个板块信息
    if (boardinfoList && boardinfoList.length > 0) {
      // 测试第一个板块
      await testBoardinfoDetailEndpoint(boardinfoList[0].bid);
      console.log('\n');
      
      // 测试一个不存在的板块
      await testBoardinfoDetailEndpoint(999);
      console.log('\n');
    }
    
    console.log('🎉 所有板块信息接口测试完成！');
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
  testBoardinfoListEndpoint,
  testBoardinfoDetailEndpoint,
  runTests
};
