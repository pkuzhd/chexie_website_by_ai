const UserInfo = require('./models/UserInfo');
const crypto = require('crypto');

async function insertTestUser() {
  try {
    // 创建一个包含逗号的用户名
    const user = await UserInfo.create({
      username: 'user,name',
      password: crypto.createHash('md5').update('test123').digest('hex'),
      sex: '男',
      score: 0
    });
    console.log('测试用户创建成功:', user);
  } catch (error) {
    console.error('测试用户创建失败:', error);
  }
}

insertTestUser();