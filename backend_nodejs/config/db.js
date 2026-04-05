const { Sequelize } = require('sequelize');
require('dotenv').config();

const isDebug = process.env.DEBUG === 'true' || process.env.DEBUG === '1';

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME, // 数据库名
  process.env.DB_USER, // 用户名
  process.env.DB_PASSWORD, // 密码
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: isDebug ? (sql, queryObject) => {
      console.log('\n[SQL]', sql);
      if (queryObject.bind) {
        console.log('[Parameters]', queryObject.bind);
      }
    } : false,
    dialectOptions: {
      charset: 'utf8mb4'
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  }
);

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(err => {
    console.error('数据库连接失败:', err.message);
  });

module.exports = sequelize;