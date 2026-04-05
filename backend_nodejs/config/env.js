require('dotenv').config();

const requiredEnvVars = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
  'DB_DIALECT',
  'DB_PORT',
  'JWT_SECRET'
];

const optionalEnvVars = [
  { name: 'PORT', defaultValue: 3000 },
  { name: 'DEBUG', defaultValue: 'false' },
  { name: 'VITE_API_HOST', defaultValue: '' },
  { name: 'NODE_ENV', defaultValue: 'development' },
  { name: 'RATE_LIMIT_WINDOW_MS', defaultValue: 15 * 60 * 1000 },
  { name: 'RATE_LIMIT_GENERAL_MAX', defaultValue: 100 },
  { name: 'RATE_LIMIT_AUTH_MAX', defaultValue: 10 }
];

function validateEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('\n❌ 缺少必需的环境变量:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n请检查 .env 文件是否包含所有必需的配置。\n');
    process.exit(1);
  }

  console.log('✅ 所有必需的环境变量已配置');

  optionalEnvVars.forEach(({ name, defaultValue }) => {
    if (!process.env[name]) {
      process.env[name] = defaultValue;
      console.log(`ℹ️  使用默认值: ${name}=${defaultValue}`);
    }
  });

  return {
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_DIALECT: process.env.DB_DIALECT,
    DB_PORT: parseInt(process.env.DB_PORT),
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: parseInt(process.env.PORT),
    DEBUG: process.env.DEBUG === 'true' || process.env.DEBUG === '1',
    VITE_API_HOST: process.env.VITE_API_HOST,
    NODE_ENV: process.env.NODE_ENV,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
    RATE_LIMIT_GENERAL_MAX: parseInt(process.env.RATE_LIMIT_GENERAL_MAX),
    RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX)
  };
}

const env = validateEnv();

module.exports = env;
