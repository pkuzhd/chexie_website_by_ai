const userInfoRepository = require('../repositories/UserInfoRepository');

class UserInfoService {
  async getUsersByUsernames(usernames) {
    const users = await userInfoRepository.findAllByUsernames(usernames, [
      'username', 'sex', 'icon', 'intro', 'regdate', 'post', 'reply', 'score'
    ]);

    const result = {};
    const foundUsernames = new Set();

    users.forEach(user => {
      result[user.username] = user;
      foundUsernames.add(user.username);
    });

    const notFoundUsers = usernames.filter(username => !foundUsernames.has(username));

    return {
      data: result,
      notFound: notFoundUsers
    };
  }

  async getUserByUsername(username) {
    const user = await userInfoRepository.findByUsernamePublic(username);
    if (!user) {
      throw new Error('用户不存在');
    }

    const result = {};
    result[username] = user;
    return result;
  }
}

module.exports = new UserInfoService();
