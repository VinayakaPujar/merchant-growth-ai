import dotenv from 'dotenv';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import Merchant from '../src/models/Merchant.js';
import Product from '../src/models/Product.js';
import Transaction from '../src/models/Transaction.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetMode = process.argv.includes('--reset');

function seededDate(baseDate, offsetDays) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + offsetDays);
  return date;
}

function pseudo(seed) {
  return Math.sin(seed * 12.9898) * 43758.5453;
}

async function main() {
  await connectDB();

  if (resetMode) {
    await Promise.all([
      Merchant.deleteMany({}),
      Product.deleteMany({}),
      Transaction.deleteMany({})
    ]);
    console.log('Demo collections were reset as requested.');
  }

  const existingMerchantCount = await Merchant.countDocuments();
  if (existingMerchantCount > 0 && !resetMode) {
    console.log('Demo merchant data already exists. Use --reset to recreate the seed data.');
    process.exit(0);
  }

  const merchantPasswordHash = await bcrypt.hash('Demo@12345', 10);
  const merchants = await Merchant.insertMany([
    {
      name: 'Priya Merchant',
      email: 'demo@merchantgrowth.ai',
      passwordHash: merchantPasswordHash,
      businessName: 'Urban Basket',
      businessCategory: 'Groceries',
      monthlyMarketingBudget: 15000,
      isDemoAccount: true
    },
    {
      name: 'Aman Retail',
      email: 'demo2@merchantgrowth.ai',
      passwordHash: merchantPasswordHash,
      businessName: 'FreshCart',
      businessCategory: 'Home essentials',
      monthlyMarketingBudget: 12000,
      isDemoAccount: true
    }
  ]);

  const productCatalog = [
    { name: 'Organic Rice', category: 'Staples', price: 110, description: 'Premium Basmati rice' },
    { name: 'Cold Pressed Oil', category: 'Groceries', price: 165, description: 'Healthy kitchen oil' },
    { name: 'Protein Bowl', category: 'Snacks', price: 220, description: 'Ready-to-eat nutrition bowl' },
    { name: 'Face Serum', category: 'Personal Care', price: 420, description: 'Daily skin support' },
    { name: 'Handwash Refills', category: 'Home Care', price: 140, description: 'Eco-friendly home care' },
    { name: 'Breakfast Mix', category: 'Packaged Food', price: 190, description: 'Quick breakfast option' }
  ];

  const insertedProducts = [];
  for (const merchant of merchants) {
    for (const product of productCatalog) {
      insertedProducts.push({
        merchantId: merchant._id,
        ...product,
        isDemoData: true
      });
    }
  }

  const createdProducts = await Product.insertMany(insertedProducts);

  const transactionsToInsert = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 75);

  for (const merchant of merchants) {
    const merchantProducts = createdProducts.filter((product) => product.merchantId.toString() === merchant._id.toString());

    for (let dayOffset = 0; dayOffset < 75; dayOffset += 1) {
      const baseMultiplier = 1 + (Math.sin((dayOffset + 3) / 5) + 1) * 0.45;
      const dailyCount = Math.max(8, Math.round(16 * baseMultiplier));

      for (let txIndex = 0; txIndex < dailyCount; txIndex += 1) {
        const product = merchantProducts[(dayOffset + txIndex) % merchantProducts.length];
        const random = pseudo(dayOffset * 10 + txIndex + merchant._id.toString().length * 2);
        const amount = Number((product.price * (1.4 + (random % 2) * 0.8)).toFixed(2));
        const statusRoll = (dayOffset + txIndex + merchant._id.toString().length) % 100;
        let status = 'success';

        if (statusRoll > 82) {
          status = 'failed';
        } else if (statusRoll > 92) {
          status = 'refunded';
        }

        const createdDate = seededDate(startDate, dayOffset);
        createdDate.setHours(9 + ((txIndex * 3) % 8), (txIndex * 17) % 60, 0, 0);

        transactionsToInsert.push({
          merchantId: merchant._id,
          amount: status === 'failed' ? Number((amount * 0.65).toFixed(2)) : amount,
          status,
          productName: product.name,
          quantity: Math.max(1, Math.round((txIndex % 4) + 1)),
          createdAt: createdDate,
          isDemoData: true,
          source: 'synthetic-demo'
        });
      }
    }
  }

  await Transaction.insertMany(transactionsToInsert);

  console.log(`Seeded ${merchants.length} merchants, ${createdProducts.length} products, and ${transactionsToInsert.length} synthetic demo transactions.`);
  console.log('Demo credentials: demo@merchantgrowth.ai / Demo@12345');
  console.log('Use --reset before re-seeding to clear demo collections explicitly.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed script failed:', error.message);
  process.exit(1);
});
