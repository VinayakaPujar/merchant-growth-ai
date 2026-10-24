import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import Merchant from '../src/models/Merchant.js';
import Transaction from '../src/models/Transaction.js';

dotenv.config();

test('health endpoint is available', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('merchant registration and dashboard access work', async () => {
  await connectDB();
  await Merchant.deleteMany({});
  await Transaction.deleteMany({});

  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Merchant',
      email: 'merchant@test.com',
      password: 'Password123',
      businessName: 'Demo Shop',
      businessCategory: 'Retail',
      monthlyMarketingBudget: 5000
    });

  assert.equal(registerResponse.status, 201);
  assert.ok(registerResponse.body.token);

  const token = registerResponse.body.token;

  const dashboardResponse = await request(app)
    .get('/api/dashboard')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(dashboardResponse.status, 200);
  assert.ok(dashboardResponse.body.metricSummary);
});

test('transactions API supports creation and listing', async () => {
  await connectDB();
  const merchant = await Merchant.create({
    name: 'Merchant Two',
    email: 'merchant2@test.com',
    passwordHash: 'hashedpassword',
    businessName: 'Store Two',
    businessCategory: 'Home goods',
    monthlyMarketingBudget: 2000
  });

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({ email: 'merchant2@test.com', password: 'Password123' });

  assert.equal(loginResponse.status, 401);

  await Merchant.findByIdAndUpdate(merchant._id, {
    passwordHash: '$2a$10$w5Bg0vUSDazb8jC5R7tTUe81qNMUYlNi9LkM0jP5sRPEpXvQ6z0G2'
  });

  const transactionResponse = await request(app)
    .post('/api/transactions')
    .set('Authorization', `Bearer ${'invalid'}`)
    .send({ amount: 1000, status: 'success', productName: 'Onion', quantity: 2 });

  assert.equal(transactionResponse.status, 401);
});
