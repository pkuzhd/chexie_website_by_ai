class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return await this.model.findAll(options);
  }

  async findOne(options = {}) {
    return await this.model.findOne(options);
  }

  async findByPk(id, options = {}) {
    return await this.model.findByPk(id, options);
  }

  async findAndCountAll(options = {}) {
    return await this.model.findAndCountAll(options);
  }

  async findOrCreate(options = {}) {
    return await this.model.findOrCreate(options);
  }

  async count(options = {}) {
    return await this.model.count(options);
  }

  async exists(options = {}) {
    const count = await this.model.count(options);
    return count > 0;
  }

  async create(data, options = {}) {
    return await this.model.create(data, options);
  }

  async bulkCreate(dataArray, options = {}) {
    return await this.model.bulkCreate(dataArray, options);
  }

  async update(data, options = {}) {
    return await this.model.update(data, options);
  }

  async increment(field, options = {}) {
    return await this.model.increment(field, options);
  }

  async decrement(field, options = {}) {
    return await this.model.decrement(field, options);
  }

  async destroy(options = {}) {
    return await this.model.destroy(options);
  }
}

module.exports = BaseRepository;
