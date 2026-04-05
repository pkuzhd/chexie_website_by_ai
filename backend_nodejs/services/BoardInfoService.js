const boardInfoRepository = require('../repositories/BoardInfoRepository');

class BoardInfoService {
  async getAllBoards() {
    return await boardInfoRepository.findAllOrderedByBid();
  }

  async getBoardByBid(bid) {
    const board = await boardInfoRepository.findByBid(bid);
    if (!board) {
      throw new Error('板块不存在');
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time1 = Math.floor(new Date(date).getTime() / 1000);
    const time2 = Math.floor(new Date(date + 'T23:59:59').getTime() / 1000);

    const startDate = new Date(date);
    const endDate = new Date(new Date(date).setDate(new Date(date).getDate() + 1));

    const [topics, extr, newpost, newreply] = await Promise.all([
      boardInfoRepository.countThreadsByBid(bid),
      boardInfoRepository.countExtrThreadsByBid(bid),
      boardInfoRepository.countTodayNewThreads(bid, startDate, endDate),
      boardInfoRepository.countTodayNewReplies(bid, time1, time2)
    ]);

    const boardData = board.toJSON();
    boardData.topics = topics;
    boardData.extr = extr;
    boardData.newpost = newpost;
    boardData.newreply = newreply;

    return boardData;
  }
}

module.exports = new BoardInfoService();
