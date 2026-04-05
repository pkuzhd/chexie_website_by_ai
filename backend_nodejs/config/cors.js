const env = require('./env');

const corsOptions = {
  origin: (origin, callback) => {
    const isDebug = env.DEBUG;

    if (isDebug) {
      callback(null, true);
      return;
    }

    const allowedOrigins = env.VITE_API_HOST
      ? env.VITE_API_HOST.split(',').map(o => o.trim())
      : [];

    if (allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      if (!origin) {
        callback(null, true);
      } else {
        const serverHost = `http://localhost:${env.PORT}`;
        if (origin === serverHost) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    }
  },
  credentials: true,
};

module.exports = corsOptions;
