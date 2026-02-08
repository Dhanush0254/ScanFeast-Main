import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const AdminItems = () => {
    const [menu, setMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showAddItem, setShowAddItem] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '', category: '', image: '' });
    const [newCategory, setNewCategory] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        axios.get(`${API_URL}/api/menu`).then(res => setMenu(res.data));
        axios.get(`${API_URL}/api/categories`).then(res => setCategories(res.data));
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price || !newItem.category) {
            toast.error('Please fill all required fields');
            return;
        }

        await axios.post(`${API_URL}/api/menu`, {
            ...newItem,
            price: parseFloat(newItem.price)
        });

        toast.success('Item added!');
        setNewItem({ name: '', price: '', category: '', image: '' });
        setShowAddItem(false);
        loadData();
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            toast.error('Please enter category name');
            return;
        }

        try {
            await axios.post(`${API_URL}/api/categories`, { name: newCategory });
            toast.success('Category added!');
            setNewCategory('');
            setShowAddCategory(false);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add category');
        }
    };

    const handleDeleteItem = async (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await axios.delete(`${API_URL}/api/menu/${id}`);
            toast.success('Item deleted!');
            loadData();
        }
    };

    const allCategories = ['Tiffins', 'Meals', 'Snacks', 'Beverages', ...categories.map(c => c.name)];

    return (
        <div className="pb-8">
            {/* Header */}
            <div className="mb-6 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold mb-2">🍽️ Items Management</h1>
                <p className="text-orange-100">Manage menu items and categories</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
                <button
                    onClick={() => setShowAddItem(!showAddItem)}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition"
                >
                    + Add New Item
                </button>
                <button
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition"
                >
                    + Add New Category
                </button>
            </div>

            {/* Add Item Form */}
            {showAddItem && (
                <div className="bg-white p-6 rounded-xl shadow-xl border-2 border-green-300 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Add New Item</h2>
                    <form onSubmit={handleAddItem} className="space-y-4">
                        <div>
                            <label className="block font-bold mb-2">Item Name *</label>
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., Masala Dosa"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-2">Price (₹) *</label>
                            <input
                                type="number"
                                value={newItem.price}
                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-2">Category *</label>
                            <select
                                value={newItem.category}
                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                                required
                            >
                                <option value="">Select Category</option>
                                {allCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-bold mb-2">Image URL</label>
                            <input
                                type="text"
                                value={newItem.image}
                                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700">
                                Add Item
                            </button>
                            <button type="button" onClick={() => setShowAddItem(false)} className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add Category Form */}
            {showAddCategory && (
                <div className="bg-white p-6 rounded-xl shadow-xl border-2 border-blue-300 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                        <div>
                            <label className="block font-bold mb-2">Category Name *</label>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Desserts"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700">
                                Add Category
                            </button>
                            <button type="button" onClick={() => setShowAddCategory(false)} className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Menu Items */}
            <div className="bg-white p-6 rounded-xl shadow-xl">
                <h2 className="text-2xl font-bold mb-4">All Menu Items ({menu.length})</h2>
                {menu.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-6xl mb-4">🍽️</div>
                        <p className="text-gray-500">No items yet. Add your first item!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {menu.map(item => (
                            <div key={item._id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition">
                                <div className="h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                                    <img src={item.image || "https://via.placeholder.com/300"} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xl font-bold text-green-600">₹{item.price}</span>
                                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">{item.category}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteItem(item._id)}
                                    className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 active:scale-95 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminItems;
