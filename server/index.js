require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Database Connection
const pool = require('./db');

pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.stack));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trading', require('./routes/trading'));

app.get('/', (req, res) => {
  res.send('PrimeTradeAI API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
