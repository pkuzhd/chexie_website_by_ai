const BaseRepository = require('./BaseRepository');
const Threads = require('../models/Threads');
const { Op } = require('sequelize');

class ThreadsRepository extends BaseRepository {
  constructor() {
    super(Threads);
  }

  async findOneByBidAndTid(bid, tid) {
    return await this.findOne({
      where: { bid, tid }
    });
  }

  async findAndCountAllByBid(bid, options = {}) {
    return await this.model.findAndCountAll({
      where: { bid, ...options.where },
      limit: options.limit,
      offset: options.offset,
      order: options.order
    });
  }

  async findAllHot(limit = 10) {
    return await this.findAll({
      order: [['timestamp', 'DESC']],
      limit
    });
  }
}

module.exports = new ThreadsRepository();
