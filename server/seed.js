const pool = require('./db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('Schema applied.');

    // Clear existing data (optional, for development)
    await pool.query('TRUNCATE TABLE historical_prices, trading_items, users RESTART IDENTITY CASCADE');

    // Create Users
    const password = await bcrypt.hash('password123', 10);
    
    // Admin User
    await pool.query(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
      ['admin', password, 'admin']
    );

    // Regular User
    await pool.query(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
      ['user', password, 'user']
    );
    console.log('Users seeded.');

    // Create Trading Items
    const items = [
      { name: 'Gold', symbol: 'XAU', price: 2000 },
      { name: 'Silver', symbol: 'XAG', price: 25 },
      { name: 'Bitcoin', symbol: 'BTC', price: 45000 },
      { name: 'Ethereum', symbol: 'ETH', price: 3000 },
      { name: 'Oil', symbol: 'WTI', price: 80 }
    ];

    const insertedItems = [];
    for (const item of items) {
      const res = await pool.query(
        `INSERT INTO trading_items (name, symbol, current_price) VALUES ($1, $2, $3) RETURNING id, name, current_price`,
        [item.name, item.symbol, item.price]
      );
      insertedItems.push(res.rows[0]);
    }
    console.log('Trading items seeded.');

    // Generate Historical Data (Jan 1, 2026 to Feb 12, 2026)
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-02-12');

    for (const item of insertedItems) {
      let currentDate = new Date(startDate);
      let price = parseFloat(item.current_price);

      while (currentDate <= endDate) {
        // Random fluctuation +/- 5%
        const change = price * (Math.random() * 0.1 - 0.05);
        price += change;
        if (price < 0) price = 1; // Prevent negative prices

        await pool.query(
          `INSERT INTO historical_prices (item_id, price, recorded_at) VALUES ($1, $2, $3)`,
          [item.id, price, currentDate.toISOString()]
        );

        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Update current price to the last generated price
      await pool.query(
        `UPDATE trading_items SET current_price = $1 WHERE id = $2`,
        [price, item.id]
      );
    }
    console.log('Historical data seeded.');

    console.log('Database seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
