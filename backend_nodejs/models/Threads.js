const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Threads = sequelize.define('Threads', {
  bid: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  replyer: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  click: {
    type: DataTypes.INTEGER,
    allowNull: false, 
    defaultValue: 0
  },
  reply: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  guesture: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  extr: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  top: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  locked: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  timestamp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  postdate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'threads',
  timestamps: false
});

module.exports = Threads;