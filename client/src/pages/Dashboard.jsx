import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [history, setHistory] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', symbol: '', current_price: '' });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/trading');
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHistory = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/trading/${id}/history`);
            setHistory(res.data);
            const item = items.find((i) => i.id === id);
            setSelectedItem(item);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/trading', newItem);
            fetchItems();
            setNewItem({ name: '', symbol: '', current_price: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to add item');
        }
    };

    return (
        <div className="dashboard-container">
            <header>
                <h1>PrimeTradeAI Dashboard</h1>
                <div>
                    <span>Welcome, {user.username} ({user.role})</span>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <div className="main-content">
                <div className="item-list">
                    <h2>Trading Items</h2>
                    <ul>
                        {items.map((item) => (
                            <li key={item.id} onClick={() => fetchHistory(item.id)}>
                                <strong>{item.name}</strong> ({item.symbol}): ${item.current_price}
                            </li>
                        ))}
                    </ul>

                    {user.role === 'admin' && (
                        <div className="admin-panel">
                            <h3>Add New Item</h3>
                            <form onSubmit={handleAddItem}>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Symbol"
                                    value={newItem.symbol}
                                    onChange={(e) => setNewItem({ ...newItem, symbol: e.target.value })}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={newItem.current_price}
                                    onChange={(e) => setNewItem({ ...newItem, current_price: e.target.value })}
                                    required
                                />
                                <button type="submit">Add Item</button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="history-view">
                    {selectedItem ? (
                        <>
                            <h2>History for {selectedItem.name}</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.slice(-10).map((record) => ( // Show last 10 records
                                        <tr key={record.id}>
                                            <td>{new Date(record.recorded_at).toLocaleDateString()}</td>
                                            <td>${record.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p>Select an item to view history</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
