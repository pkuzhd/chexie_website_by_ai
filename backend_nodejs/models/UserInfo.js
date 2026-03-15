const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/db');

// 定义UserInfo模型
const UserInfo = sequelize.define('userinfo', {
  // 字段名对应数据库表中的字段
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    field: 'username'
  },
  password: {
    type: DataTypes.STRING(45),
    allowNull: false,
    field: 'password'
  },
  token: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'token'
  },
  tokentime: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'tokentime'
  },
  sex: {
    type: DataTypes.STRING(2),
    allowNull: false,
    field: 'sex'
  },
  icon: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'icon'
  },
  intro: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'intro'
  },
  sig1: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    field: 'sig1'
  },
  sig2: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    field: 'sig2'
  },
  sig3: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    field: 'sig3'
  },
  hobby: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'hobby'
  },
  qq: {
    type: DataTypes.STRING(12),
    allowNull: true,
    field: 'qq'
  },
  mail: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'mail'
  },
  place: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'place'
  },
  regdate: {
    type: DataTypes.STRING(12),
    allowNull: true,
    field: 'regdate'
  },
  lastdate: {
    type: DataTypes.STRING(12),
    allowNull: true,
    field: 'lastdate'
  },
  lastip: {
    type: DataTypes.STRING(60),
    allowNull: true,
    field: 'lastip'
  },
  star: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
    field: 'star'
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'score'
  },
  post: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
    field: 'post'
  },
  reply: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
    field: 'reply'
  },
  water: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
    field: 'water'
  },
  sign: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: true,
    field: 'sign'
  },
  rights: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    field: 'rights'
  },
  newmsg: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    field: 'newmsg'
  },
  extr: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    field: 'extr'
  },
  lastpost: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'lastpost'
  },
  nowboard: {
    type: DataTypes.SMALLINT,
    allowNull: true,
    field: 'nowboard'
  },
  onlinetype: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'onlinetype'
  },
  logininfo: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'logininfo'
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'code'
  },
  other2: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'other2'
  },
  other3: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'other3'
  },
  other4: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'other4'
  },
  other5: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'other5'
  },
  other6: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'other6'
  },
  userid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    field: 'userid'
  }
}, {
  // 模型配置
  tableName: 'userinfo', // 指定数据库表名
  timestamps: false, // 禁用默认的timestamps字段
  indexes: [
    {
      name: 'username',
      fields: ['username']
    },
    {
      name: 'token',
      fields: ['token']
    }
  ]
});

// 导出模型和操作符
module.exports = UserInfo;
module.exports.Op = Op;