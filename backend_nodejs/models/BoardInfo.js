const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 定义BoardInfo模型
const BoardInfo = sequelize.define('boardinfo', {
  // 字段名对应数据库表中的字段
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
  // 模型配置
  tableName: 'boardinfo', // 指定数据库表名
  timestamps: false, // 禁用默认的timestamps字段
  indexes: [
    {
      name: 'bid',
      fields: ['bid']
    }
  ]
});

module.exports = BoardInfo;
