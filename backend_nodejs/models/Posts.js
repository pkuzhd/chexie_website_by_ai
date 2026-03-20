const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Posts = sequelize.define('Posts', {
  bid: {
    type: DataTypes.TINYINT,
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
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  text: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  ishtml: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  attachs: {
    type: DataTypes.TEXT('medium'),
    allowNull: false,
  },
  replytime: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  updatetime: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  sig: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  type: {
    type: DataTypes.TEXT,
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
  timestamps: false,
});

module.exports = Posts;