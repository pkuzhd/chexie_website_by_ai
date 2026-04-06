const BaseRepository = require('./BaseRepository');
const Threads = require('../models/Threads');
const ThreadGlobalTop = require('../models/ThreadGlobalTop');
const { Op, literal } = require('sequelize');

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
    return await this.findAndCountAll({
      where: { bid, ...options.where },
      ...options
    });
  }

  async findAllHot(limit = 10) {
    return await this.findAll({
      order: [['timestamp', 'DESC']],
      limit
    });
  }

  async findHotThreadsWithoutGlobalTop(limit = 10) {
    const threads = await Threads.findAll({
      attributes: [
        'bid', 'tid', 'title', 'author', 'replyer', 'click', 'reply', 
        'extr', 'top', 'locked', 'timestamp', 'postdate',
        [literal('0'), 'global_top']
      ],
      where: literal(`
        NOT EXISTS (
          SELECT 1 
          FROM thread_global_top 
          WHERE thread_global_top.bid = Threads.bid 
            AND thread_global_top.tid = Threads.tid
        )
      `),
      order: [['timestamp', 'DESC']],
      limit,
      raw: true
    });
    return threads;
  }

  async findGlobalTopThreads() {
    const globalTopIds = await ThreadGlobalTop.findAll({
      attributes: ['bid', 'tid'],
      raw: true
    });

    if (globalTopIds.length === 0) {
      return [];
    }

    const threads = await Threads.findAll({
      attributes: [
        'bid', 'tid', 'title', 'author', 'replyer', 'click', 'reply', 
        'extr', 'top', 'locked', 'timestamp', 'postdate'
      ],
      where: {
        [Op.or]: globalTopIds
      },
      raw: true
    });

    return threads.map(thread => ({
      ...thread,
      global_top: 1
    }));
  }
}

module.exports = new ThreadsRepository();
