import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const AdminFAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: 'General' });

    useEffect(() => {
        loadFAQs();
    }, []);

    const loadFAQs = () => {
        axios.get(`${API_URL}/api/faqs`).then(res => setFaqs(res.data));
    };

    const handleAddFAQ = async (e) => {
        e.preventDefault();
        if (!newFAQ.question || !newFAQ.answer) {
            toast.error('Please fill all fields');
            return;
        }

        await axios.post(`${API_URL}/api/faqs`, newFAQ);
        toast.success('FAQ added!');
        setNewFAQ({ question: '', answer: '', category: 'General' });
        setShowAddForm(false);
        loadFAQs();
    };

    const handleDeleteFAQ = async (id) => {
        if (confirm('Are you sure you want to delete this FAQ?')) {
            await axios.delete(`${API_URL}/api/faqs/${id}`);
            toast.success('FAQ deleted!');
            loadFAQs();
        }
    };

    return (
        <div className="pb-8">
            {/* Header */}
            <div className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold mb-2">❓ FAQ Management</h1>
                <p className="text-purple-100">Manage frequently asked questions</p>
            </div>

            {/* Add Button */}
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition mb-6"
            >
                + Add New FAQ
            </button>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-xl border-2 border-green-300 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Add New FAQ</h2>
                    <form onSubmit={handleAddFAQ} className="space-y-4">
                        <div>
                            <label className="block font-bold mb-2">Question *</label>
                            <input
                                type="text"
                                value={newFAQ.question}
                                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., What are your opening hours?"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-2">Answer *</label>
                            <textarea
                                value={newFAQ.answer}
                                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                                rows="4"
                                placeholder="e.g., We are open from 8 AM to 10 PM every day."
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-2">Category</label>
                            <select
                                value={newFAQ.category}
                                onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                            >
                                <option value="General">General</option>
                                <option value="Orders">Orders</option>
                                <option value="Payment">Payment</option>
                                <option value="Menu">Menu</option>
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700">
                                Add FAQ
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* FAQ List */}
            <div className="bg-white p-6 rounded-xl shadow-xl">
                <h2 className="text-2xl font-bold mb-4">All FAQs ({faqs.length})</h2>
                {faqs.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-gray-500">No FAQs yet. Add your first one!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map(faq => (
                            <div key={faq._id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg flex-1">{faq.question}</h3>
                                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded ml-2">{faq.category}</span>
                                </div>
                                <p className="text-gray-700 mb-3">{faq.answer}</p>
                                <button
                                    onClick={() => handleDeleteFAQ(faq._id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 active:scale-95 transition text-sm"
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

export default AdminFAQ;
