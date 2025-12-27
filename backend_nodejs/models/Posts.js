const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 定义Posts模型
const Posts = sequelize.define('Posts', {
  bid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ishtml: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  attachs: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  replytime: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updatetime: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sig: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  lzl: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'posts',
  timestamps: false, // 不使用Sequelize默认的时间戳字段
});

module.exports = Posts;