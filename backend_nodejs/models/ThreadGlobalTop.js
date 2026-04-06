const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ThreadGlobalTop = sequelize.define('ThreadGlobalTop', {
  bid: {
    type: DataTypes.TINYINT,
    allowNull: false,
    primaryKey: true
  },
  tid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
}, {
  tableName: 'thread_global_top',
  timestamps: false
});

module.exports = ThreadGlobalTop;
