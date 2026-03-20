const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BoardInfo = sequelize.define('boardinfo', {
  bid: {
    type: DataTypes.TINYINT,
    allowNull: false,
    primaryKey: true,
    field: 'bid'
  },
  name: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'name'
  },
  bbstitle: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'bbstitle'
  },
  hide: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    field: 'hide'
  },
  m1: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'm1'
  },
  m2: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'm2'
  },
  m3: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'm3'
  },
  m4: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'm4'
  },
  need: {
    type: DataTypes.TINYINT,
    allowNull: true,
    field: 'need'
  }
}, {
  tableName: 'boardinfo',
  timestamps: false
});

module.exports = BoardInfo;
