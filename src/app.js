const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

const projectsRoutes = require('./routes/projects.routes');
const errorHandler = require('./middlewares/errorHandler');
const swaggerSpec = require('./docs/swagger');

dotenv.config();

const app = express();
const swaggerPort = process.env.PORT || 3000;
const swaggerDoc = {
  ...swaggerSpec,
  servers: [{ url: `http://localhost:${swaggerPort}` }]
};

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) return cb(null, true);
    if (allowedOrigins.includes('*')) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }
};

app.use(helmet());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors(corsOptions));

app.use(express.static('public'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, { explorer: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, data: { status: 'up' } });
});

app.use('/api/projects', projectsRoutes);

app.use(errorHandler);

module.exports = app;
