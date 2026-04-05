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
      }
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

  async updateLoginInfo(userid, token, tokentime, lastip, lastdate, onlinetype, logininfo) {
    return await this.update(
      {
        token,
        tokentime,
        nowboard: null,
        lastip,
        lastdate,
        onlinetype,
        logininfo
      },
      { where: { userid } }
    );
  }

  async updateLogoutInfo(userid, lastip, lastdate) {
    return await this.update(
      {
        token: null,
        tokentime: null,
        nowboard: null,
        lastip,
        lastdate
      },
      { where: { userid } }
    );
  }
}

module.exports = new UserInfoRepository();
