const { Sequelize } = require('sequelize');
const env = require('./env');

const isDebug = env.DEBUG;

// 创建数据库连接
const sequelize = new Sequelize(
  env.DB_NAME, // 数据库名
  env.DB_USER, // 用户名
  env.DB_PASSWORD, // 密码
  {
    host: env.DB_HOST,
    dialect: env.DB_DIALECT,
    port: env.DB_PORT,
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

// 优雅关闭数据库连接
const gracefulShutdown = async (signal) => {
  console.log(`\n接收到 ${signal} 信号，正在关闭数据库连接...`);
  try {
    await sequelize.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
    process.exit(1);
  }
};

// 监听终止信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = sequelize;