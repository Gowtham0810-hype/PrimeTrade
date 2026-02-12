const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all trading items
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trading_items ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get historical data for an item
router.get('/:id/history', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM historical_prices WHERE item_id = $1 ORDER BY recorded_at ASC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Add new item
router.post('/', [verifyToken, isAdmin], async (req, res) => {
  const { name, symbol, current_price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO trading_items (name, symbol, current_price) VALUES ($1, $2, $3) RETURNING *',
      [name, symbol, current_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update item
router.put('/:id', [verifyToken, isAdmin], async (req, res) => {
  const { id } = req.params;
  const { name, symbol, current_price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE trading_items SET name = $1, symbol = $2, current_price = $3 WHERE id = $4 RETURNING *',
      [name, symbol, current_price, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete item
router.delete('/:id', [verifyToken, isAdmin], async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM trading_items WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
