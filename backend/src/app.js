import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import transactionsRoutes from './routes/transactions.js';
import insightsRoutes from './routes/insights.js';
import chatRoutes from './routes/chat.js';
import forecastRoutes from './routes/forecast.js';
import offersRoutes from './routes/offers.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy rejected this origin.'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'merchant-growth-ai-backend',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/offers', offersRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error('Unhandled backend error:', error.message);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'An unexpected server error occurred.';

  if (process.env.NODE_ENV !== 'production') {
    return res.status(statusCode).json({ message, stack: error.stack });
  }

  return res.status(statusCode).json({ message: 'Internal server error.' });
});

export default app;
