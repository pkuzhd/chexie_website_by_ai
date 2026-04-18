const BaseRepository = require('./BaseRepository');
const Posts = require('../models/Posts');
const { Op } = require('sequelize');

class PostsRepository extends BaseRepository {
  constructor() {
    super(Posts);
  }

  async findAllByBidAndTid(bid, tid, options = {}) {
    return await this.findAll({
      where: { bid, tid },
      ...options
    });
  }

  async countByBidAndTid(bid, tid) {
    return await this.count({
      where: { bid, tid }
    });
  }

  async findOneByBidAndTidAndPid(bid, tid, pid) {
    return await this.findOne({
      where: { bid, tid, pid }
    });
  }

  async findOneByFid(fid) {
    return await this.findOne({
      where: { fid }
    });
  }

  async findRecentByAuthor(author, limit = 10) {
    return await this.findAll({
      where: { author, pid: { [Op.gt]: 1 } },
      attributes: ['bid', 'tid', 'pid', 'title', 'replytime'],
      order: [['replytime', 'DESC']],
      limit,
      raw: true
    });
  }
}

module.exports = new PostsRepository();
