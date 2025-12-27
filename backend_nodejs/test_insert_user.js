const UserInfo = require('./models/UserInfo');

async function insertTestUser() {
  try {
    // 创建一个包含逗号的用户名
    const user = await UserInfo.create({
      username: 'user,name',
      password: 'test123',
      sex: '男',
      score: 0
    });
    console.log('测试用户创建成功:', user);
  } catch (error) {
    console.error('测试用户创建失败:', error);
  }
}

insertTestUser();