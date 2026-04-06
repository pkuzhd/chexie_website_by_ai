const BaseRepository = require('./BaseRepository');
const Threads = require('../models/Threads');
const ThreadGlobalTop = require('../models/ThreadGlobalTop');
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
    const allGlobalTop = await ThreadGlobalTop.findAll({
      attributes: ['bid', 'tid'],
      raw: true
    });

    const globalTopMap = new Map();
    allGlobalTop.forEach(t => {
      globalTopMap.set(`${t.bid}-${t.tid}`, true);
    });

    const result = [];
    let offset = 0;
    const batchSize = limit * 2;

    while (result.length < limit) {
      const threads = await Threads.findAll({
        attributes: [
          'bid', 'tid', 'title', 'author', 'replyer', 'click', 'reply', 
          'extr', 'top', 'locked', 'timestamp', 'postdate'
        ],
        order: [['timestamp', 'DESC']],
        limit: batchSize,
        offset,
        raw: true
      });

      if (threads.length === 0) {
        break;
      }

      const filteredThreads = threads
        .filter(thread => !globalTopMap.has(`${thread.bid}-${thread.tid}`))
        .map(thread => ({
          ...thread,
          global_top: 0
        }));

      result.push(...filteredThreads);
      offset += batchSize;

      if (threads.length < batchSize) {
        break;
      }
    }

    return result.slice(0, limit);
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
