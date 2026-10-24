import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Merchant Growth AI backend is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
