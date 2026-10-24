# Merchant Growth AI

A full-stack SaaS MVP for small merchants to track sales, get AI-led insights, forecast revenue, manage offers, and review transactions.

## Features
- Merchant registration and JWT login
- Protected dashboard with sales KPIs
- AI-generated business insights with fallback mode
- Merchant chat assistant for growth questions
- 7-day sales forecast using moving averages
- Offer generation with budget validation
- Transaction listing, creation, and CSV import support
- MongoDB-backed demo seed data for reproducible testing

## Tech stack
- Frontend: React + Vite + Recharts + lucide-react
- Backend: Node.js + Express + Mongoose
- Database: MongoDB
- AI: Gemini (backend only)
- Auth: JWT + bcrypt
- Tests: Node.js test runner + Supertest

## Project structure

merchant-growth-ai/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
      app.js
      server.js
    scripts/
      seed.js
    tests/
    .env.example
    package.json
  frontend/
    src/
      components/
      context/
      pages/
      services/
      App.jsx
      main.jsx
      index.css
    index.html
    vite.config.js
    .env.example
    package.json
  .gitignore
  README.md

## Prerequisites
- Node.js v18+
- MongoDB local instance or MongoDB Atlas
- Gemini API key (optional for live AI features; fallback works without it)

## Backend setup
1. Open a terminal in `backend`.
2. Run:
   npm install
3. Copy `.env.example` to `.env` and adjust values.
4. Start MongoDB locally or configure `MONGODB_URI` to Atlas.
5. Seed synthetic demo data:
   npm run seed
6. Start the backend:
   npm run dev

## Frontend setup
1. Open a terminal in `frontend`.
2. Run:
   npm install
3. Copy `.env.example` to `.env`.
4. Start the frontend:
   npm run dev
5. Open the local Vite URL shown in the terminal.

## Environment variables
Backend `.env`:
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/merchant_growth_ai
JWT_SECRET=change_this_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash

Frontend `.env`:
VITE_API_URL=http://localhost:5000/api

## Demo login
The seed script creates demo merchants.
- Email: demo@merchantgrowth.ai
- Password: Demo@12345

## API overview
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/dashboard
- GET /api/transactions
- POST /api/transactions
- POST /api/transactions/import
- GET /api/insights
- POST /api/chat
- GET /api/forecast
- POST /api/offers

## Testing
From `backend`:
npm test

## Production frontend build
From `frontend`:
npm run build

## Deployment notes
- Deploy backend to a Node.js host with MongoDB connection enabled
- Deploy frontend to a static host such as Vercel or Netlify
- Keep backend secrets in environment variables
- Set CORS origin to your deployed frontend URL
- Do not expose Gemini API keys in client-side code

## Safety and limitations
- This MVP uses synthetic demo data and is not an official Paytm integration.
- AI responses may fall back gracefully when the Gemini API key is missing or the service errors.
- Forecasting is a simple historical estimate and not a guarantee of future performance.

## Common troubleshooting
- MongoDB connection failure: confirm MongoDB is running and `MONGODB_URI` is correct.
- CORS error: verify `FRONTEND_URL` or Vite dev server origin is allowed by the backend.
- AI not responding: check `GEMINI_API_KEY` and ensure the API is enabled.
- App not loading: reinstall dependencies and confirm the frontend `.env` points to the backend URL.

## License
This project is for educational and hackathon demo purposes.
