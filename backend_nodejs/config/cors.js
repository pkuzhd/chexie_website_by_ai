require('dotenv').config();

const corsOptions = {
  origin: (origin, callback) => {
    const isDebug = process.env.DEBUG === 'true' || process.env.DEBUG === '1';

    if (isDebug) {
      callback(null, true);
      return;
    }

    const allowedOrigins = process.env.VITE_API_HOST
      ? process.env.VITE_API_HOST.split(',').map(o => o.trim())
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
        const serverHost = `http://localhost:${process.env.PORT || 3000}`;
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
