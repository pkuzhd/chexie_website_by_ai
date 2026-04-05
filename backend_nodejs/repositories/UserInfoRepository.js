const BaseRepository = require('./BaseRepository');
const UserInfo = require('../models/UserInfo');
const { Op } = require('sequelize');

class UserInfoRepository extends BaseRepository {
  constructor() {
    super(UserInfo);
  }

  async findByUsername(username) {
    return await this.findOne({
      where: { username }
    });
  }

  async findByUserid(userid, attributes = null) {
    const options = {
      where: { userid }
    };
    if (attributes) {
      options.attributes = attributes;
    }
    return await this.findOne(options);
  }

  async updateTokenAndTime(userid, token, tokentime) {
    return await this.update(
      { token, tokentime },
      { where: { userid } }
    );
  }

  async clearTokenAndTime(userid) {
    return await this.update(
      { token: null, tokentime: null },
      { where: { userid } }
    );
  }

  async findAllByUsernames(usernames, attributes = null) {
    const options = {
      where: { username: usernames }
    };
    if (attributes) {
      options.attributes = attributes;
    }
    return await this.findAll(options);
  }

  async findByUsernamePublic(username) {
    return await this.findOne({
      where: { username },
      attributes: ['username', 'sex', 'icon', 'intro', 'regdate', 'post', 'reply', 'score']
    });
  }

  async findByTokenAndValidTokenTime(token, validTime) {
    const nowtime = Math.floor(Date.now() / 1000);
    return await this.findOne({
      where: {
        token,
        tokentime: { [Op.gt]: nowtime - validTime }
      },
      attributes: ['username', 'rights', 'icon', 'score', 'star', 'newmsg']
    });
  }

  async findByUsernameAndValidTokenTime(username, validTime) {
    const nowtime = Math.floor(Date.now() / 1000);
    return await this.findOne({
      where: {
        username,
        tokentime: { [Op.gt]: nowtime - validTime }
      }
    });
  }

  async findByToken(token) {
    return await this.findOne({
      where: { token }
    });
  }
}

module.exports = new UserInfoRepository();
