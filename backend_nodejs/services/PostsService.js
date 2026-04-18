const postsRepository = require('../repositories/PostsRepository');

class PostsService {
  async getPostsList(bid, tid, options) {
    const { page = 1, pageSize = 12 } = options;
    const offset = (page - 1) * pageSize;

    const [posts, total] = await Promise.all([
      postsRepository.findAllByBidAndTid(bid, tid, {
        limit: pageSize,
        offset,
        order: [['fid', 'ASC']]
      }),
      postsRepository.countByBidAndTid(bid, tid)
    ]);

    return {
      posts,
      pagination: {
        current_page: page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize)
      }
    };
  }

  async getPostByBidAndTidAndPid(bid, tid, pid) {
    const post = await postsRepository.findOneByBidAndTidAndPid(bid, tid, pid);
    if (!post) {
      throw new Error('帖子不存在');
    }
    return post;
  }

  async getRecentPostsByAuthor(author, limit = 10) {
    return await postsRepository.findRecentByAuthor(author, limit);
  }

  async getPostByFid(fid) {
    const post = await postsRepository.findOneByFid(fid);
    if (!post) {
      throw new Error('帖子不存在');
    }
    return post;
  }
}

module.exports = new PostsService();
