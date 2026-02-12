const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  try {
    console.log('Starting API Tests...');

    // 1. Register User
    const username = `testuser_${Date.now()}`;
    const password = 'password123';
    console.log(`\n1. Registering user: ${username}`);
    
    try {
      await axios.post(`${API_URL}/auth/register`, { username, password });
      console.log('   [SUCCESS] User registered');
    } catch (err) {
      console.log('   [FAILURE] Registration failed:', err.response?.data || err.message);
    }

    // 2. Login User
    console.log('\n2. Logging in...');
    let token;
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      token = res.data.token;
      console.log('   [SUCCESS] Login successful, token received');
    } catch (err) {
      console.log('   [FAILURE] Login failed:', err.response?.data || err.message);
      return;
    }

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Get Trading Items
    console.log('\n3. Fetching Trading Items...');
    let items = [];
    try {
      const res = await axios.get(`${API_URL}/trading`, authHeaders);
      items = res.data;
      console.log(`   [SUCCESS] Fetched ${items.length} items`);
      if (items.length > 0) {
        console.log(`   Example: ${items[0].name} (${items[0].symbol}): $${items[0].current_price}`);
      }
    } catch (err) {
      console.log('   [FAILURE] Fetching items failed:', err.response?.data || err.message);
    }

    // 4. Get History for First Item
    if (items.length > 0) {
      console.log(`\n4. Fetching History for ${items[0].name}...`);
      try {
        const res = await axios.get(`${API_URL}/trading/${items[0].id}/history`, authHeaders);
        console.log(`   [SUCCESS] Fetched ${res.data.length} history records`);
      } catch (err) {
        console.log('   [FAILURE] Fetching history failed:', err.response?.data || err.message);
      }
    }

    // 5. Try Admin Action as User (Should Fail)
    console.log('\n5. Testing RBAC (Add Item as User)...');
    try {
      await axios.post(`${API_URL}/trading`, {
        name: 'TestItem',
        symbol: 'TST',
        current_price: 100
      }, authHeaders);
      console.log('   [FAILURE] User was able to add item (Should require Admin)');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('   [SUCCESS] Request blocked as expected (403 Forbidden)');
      } else {
        console.log('   [FAILURE] Unexpected error:', err.response?.status, err.message);
      }
    }

    console.log('\nAPI Tests Complete.');
  } catch (err) {
    console.error('Test Script Error:', err);
  }
};

runTests();
