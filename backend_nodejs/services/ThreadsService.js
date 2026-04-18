const { Op } = require('sequelize');
const threadsRepository = require('../repositories/ThreadsRepository');

class ThreadsService {
  async getThreadByBidAndTid(bid, tid) {
    const thread = await threadsRepository.findOneByBidAndTid(bid, tid);
    if (!thread) {
      throw new Error('主题帖不存在');
    }
    return thread;
  }

  async getThreadsList(bid, options) {
    const { page = 1, pageSize = 10, extr = 0, sortBy = 'default' } = options;
    const start = (page - 1) * pageSize;

    let order;
    switch (sortBy) {
      case 'tid_asc':
        order = [['tid', 'ASC']];
        break;
      case 'tid_desc':
        order = [['tid', 'DESC']];
        break;
      default:
        order = [
          ['top', 'DESC'],
          ['timestamp', 'DESC']
        ];
    }

    const { count: total, rows: threads } = await threadsRepository.findAndCountAllByBid(bid, {
      where: { extr: { [Op.gte]: extr } },
      limit: pageSize,
      offset: start,
      order
    });

    const threadsWithGlobalTop = threads.map(thread => {
      const threadData = thread.toJSON();
      threadData.global_top = 0;
      return threadData;
    });

    return {
      threads: threadsWithGlobalTop,
      pagination: {
        current_page: page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize)
      }
    };
  }

  async getHotThreads(limit = 10) {
    return await threadsRepository.findAllHot(limit);
  }

  async getHotThreadsWithoutGlobalTop(limit = 10) {
    return await threadsRepository.findHotThreadsWithoutGlobalTop(limit);
  }

  async getRecentThreadsByAuthor(author, limit = 10) {
    return await threadsRepository.findRecentByAuthor(author, limit);
  }

  async getGlobalTopThreads() {
    return await threadsRepository.findGlobalTopThreads();
  }
}

module.exports = new ThreadsService();
