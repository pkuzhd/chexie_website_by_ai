const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Threads = sequelize.define('Threads', {
  bid: {
    type: DataTypes.TINYINT,
    allowNull: false,
    primaryKey: true
  },
  tid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  author: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  replyer: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  click: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reply: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  guesture: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  extr: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  top: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  locked: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  postdate: {
    type: DataTypes.STRING(30),
    allowNull: true
  }
}, {
  tableName: 'threads',
  timestamps: false
});

module.exports = Threads;