import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { API_URL, SOCKET_URL } from '../config';

const FAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    // --- PREDEFINED FAQS ---
    const STATIC_FAQS = [
        {
            _id: 's1',
            question: 'How do I pay?',
            answer: 'You can pay via UPI at the counter or directly through the app after placing your order.'
        },
        {
            _id: 's2',
            question: 'Where is my order?',
            answer: 'You can track your order status in the "My Orders" tab. It shows real-time updates from the kitchen.'
        },
        {
            _id: 's3',
            question: 'Can I cancel my order?',
            answer: 'Orders can only be canceled if they are still in "Placed" status. Once "Accepted" by the kitchen, they cannot be canceled.'
        },
        {
            _id: 's4',
            question: 'Do you serve non-veg?',
            answer: 'Yes, look for the red dot icon on the menu items.'
        }
    ];

    useEffect(() => {
        // Load FAQs
        axios.get(`${API_URL}/api/faqs`).then(res => {
            // Combine API FAQs with Static FAQs
            setFaqs([...res.data, ...STATIC_FAQS]);
        });
    }, []);

    return (
        <div className="pb-8">
            {/* Header */}
            <div className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold mb-2">❓ Frequently Asked Questions</h1>
                <p className="text-purple-100">Find answers to common questions</p>
            </div>

            {/* FAQs */}
            <div className="space-y-4 mb-8">
                {faqs.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-gray-500">No FAQs available yet</p>
                    </div>
                ) : (
                    faqs.map(faq => (
                        <div key={faq._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                                className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition"
                            >
                                <h3 className="font-bold text-lg pr-4">{faq.question}</h3>
                                <svg
                                    className={`w-6 h-6 text-gray-500 transition-transform ${expandedId === faq._id ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {expandedId === faq._id && (
                                <div className="p-4 pt-0 text-gray-700 border-t bg-gray-50">
                                    <p className="leading-relaxed">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FAQ;
