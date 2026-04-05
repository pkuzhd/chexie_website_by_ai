class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      throw this._createRepositoryError('findAll', error);
    }
  }

  async findOne(options = {}) {
    try {
      return await this.model.findOne(options);
    } catch (error) {
      throw this._createRepositoryError('findOne', error);
    }
  }

  async findByPk(id, options = {}) {
    try {
      if (id == null) {
        throw new Error('id 参数不能为空');
      }
      return await this.model.findByPk(id, options);
    } catch (error) {
      throw this._createRepositoryError('findByPk', error);
    }
  }

  async findAndCountAll(options = {}) {
    try {
      return await this.model.findAndCountAll(options);
    } catch (error) {
      throw this._createRepositoryError('findAndCountAll', error);
    }
  }

  async findOrCreate(options = {}) {
    try {
      return await this.model.findOrCreate(options);
    } catch (error) {
      throw this._createRepositoryError('findOrCreate', error);
    }
  }

  async count(options = {}) {
    try {
      return await this.model.count(options);
    } catch (error) {
      throw this._createRepositoryError('count', error);
    }
  }

  async exists(options = {}) {
    try {
      const count = await this.model.count(options);
      return count > 0;
    } catch (error) {
      throw this._createRepositoryError('exists', error);
    }
  }

  async create(data, options = {}) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('data 参数必须是一个对象');
      }
      return await this.model.create(data, options);
    } catch (error) {
      throw this._createRepositoryError('create', error);
    }
  }

  async bulkCreate(dataArray, options = {}) {
    try {
      if (!Array.isArray(dataArray)) {
        throw new Error('dataArray 参数必须是一个数组');
      }
      return await this.model.bulkCreate(dataArray, options);
    } catch (error) {
      throw this._createRepositoryError('bulkCreate', error);
    }
  }

  async update(data, options = {}) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('data 参数必须是一个对象');
      }
      if (!options.where) {
        throw new Error('update 操作必须提供 where 条件');
      }
      return await this.model.update(data, options);
    } catch (error) {
      throw this._createRepositoryError('update', error);
    }
  }

  async increment(field, options = {}) {
    try {
      if (!field) {
        throw new Error('field 参数不能为空');
      }
      return await this.model.increment(field, options);
    } catch (error) {
      throw this._createRepositoryError('increment', error);
    }
  }

  async decrement(field, options = {}) {
    try {
      if (!field) {
        throw new Error('field 参数不能为空');
      }
      return await this.model.decrement(field, options);
    } catch (error) {
      throw this._createRepositoryError('decrement', error);
    }
  }

  async destroy(options = {}) {
    try {
      return await this.model.destroy(options);
    } catch (error) {
      throw this._createRepositoryError('destroy', error);
    }
  }

  _createRepositoryError(method, originalError) {
    const modelName = this.model.name || 'Model';
    const error = new Error(`[${modelName}Repository.${method}] ${originalError.message}`);
    error.stack = originalError.stack || error.stack;
    error.originalError = originalError;
    error.method = method;
    error.model = modelName;
    return error;
  }
}

module.exports = BaseRepository;
