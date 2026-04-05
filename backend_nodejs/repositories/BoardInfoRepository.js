const BaseRepository = require('./BaseRepository');
const BoardInfo = require('../models/BoardInfo');
const Threads = require('../models/Threads');
const Posts = require('../models/Posts');
const { Op } = require('sequelize');

class BoardInfoRepository extends BaseRepository {
  constructor() {
    super(BoardInfo);
  }

  async findAllOrderedByBid() {
    return await this.findAll({
      order: [['bid', 'ASC']]
    });
  }

  async findByBid(bid) {
    return await this.findOne({
      where: { bid }
    });
  }

  async countThreadsByBid(bid) {
    return await Threads.count({
      where: { bid }
    });
  }

  async countExtrThreadsByBid(bid) {
    return await Threads.count({
      where: { bid, extr: 1 }
    });
  }

  async countTodayNewThreads(bid, startDate, endDate) {
    return await Threads.count({
      where: {
        bid,
        postdate: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      }
    });
  }

  async countTodayNewReplies(bid, time1, time2) {
    return await Posts.count({
      where: {
        bid,
        replytime: {
          [Op.gte]: time1,
          [Op.lte]: time2
        }
      }
    });
  }
}

module.exports = new BoardInfoRepository();
