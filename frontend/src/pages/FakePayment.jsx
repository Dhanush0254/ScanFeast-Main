import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const FakePayment = () => {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [step, setStep] = useState('upiselect'); // upiselect, pin, processing, success
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const tableNo = localStorage.getItem('tableNo');
    const amount = cart.reduce((a, b) => a + (b.price * (b.qty || 1)), 0);
    const [paidAmount, setPaidAmount] = useState(0);

    const handlePayClick = () => {
        setStep('pin');
    };

    const handlePay = async () => {
        if (pin.length !== 4) {
            toast.error("Enter 4-digit UPI PIN");
            return;
        }

        setStep('processing');

        setTimeout(async () => {
            try {
                // Store amount before clearing cart
                setPaidAmount(amount);

                // Place order (backend automatically updates admin wallet)
                await axios.post(`${API_URL}/api/orders`, {
                    tableNo,
                    items: cart,
                    totalAmount: amount
                });

                localStorage.removeItem('cart');
                setStep('success');

                setTimeout(() => navigate('/orders'), 2000);
            } catch (e) {
                console.error('Payment error:', e);
                toast.error("Payment Failed");
                setStep('pin');
            }
        }, 1500);
    };

    // UPI Selection Screen
    if (step === 'upiselect') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Pay with UPI</h2>
                        <p className="text-3xl font-bold">₹{amount}</p>
                        <p className="text-sm opacity-90 mt-1">Table {tableNo} • {cart.length} items</p>
                    </div>

                    <div className="p-6">
                        <p className="text-gray-600 mb-4 font-medium">Choose payment method</p>

                        <button
                            onClick={handlePayClick}
                            className="w-full flex items-center justify-between bg-white border-2 border-gray-200 hover:border-blue-500 p-4 rounded-xl mb-3 transition group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    ₹
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-800">ScanFeast Pay</p>
                                    <p className="text-xs text-gray-500">Dummy UPI Payment</p>
                                </div>
                            </div>
                            <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <span className="font-bold">💡 Tip:</span> Use any 4-digit PIN (e.g., 1234)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Processing Screen
    if (step === 'processing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white p-4">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">⟳</div>
                    <h2 className="font-bold text-2xl mb-2">Processing Payment...</h2>
                    <p className="text-blue-100">Please wait</p>
                </div>
            </div>
        );
    }

    // Success Screen
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white p-4">
                <div className="text-center">
                    <div className="text-8xl mb-4 animate-bounce">✅</div>
                    <h2 className="font-bold text-3xl mb-2">Payment Successful!</h2>
                    <p className="text-2xl font-bold mb-1">₹{paidAmount}</p>
                    <p className="text-green-100">Redirecting to orders...</p>
                </div>
            </div>
        );
    }

    // PIN Entry Screen
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white">
                    <p className="text-sm opacity-80 mb-1">Paying to</p>
                    <p className="font-bold text-lg">ScanFeast Restaurant</p>
                    <h1 className="text-4xl font-bold mt-3">₹{amount}</h1>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="mb-6 font-bold text-gray-700 text-lg">ENTER UPI PIN</p>
                        <div className="flex justify-center gap-4">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-5 h-5 rounded-full border-2 transition ${pin.length > i
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <button
                                key={n}
                                onClick={() => setPin(p => p.length < 4 ? p + n : p)}
                                className="p-4 text-2xl font-bold hover:bg-gray-100 rounded-xl active:bg-gray-200 transition"
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setPin('')}
                            className="p-4 text-red-500 font-bold hover:bg-red-50 rounded-xl"
                        >
                            CLR
                        </button>
                        <button
                            onClick={() => setPin(p => p.length < 4 ? p + '0' : p)}
                            className="p-4 text-2xl font-bold hover:bg-gray-100 rounded-xl active:bg-gray-200 transition"
                        >
                            0
                        </button>
                        <button
                            onClick={handlePay}
                            className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 active:scale-95 transition"
                        >
                            PAY
                        </button>
                    </div>

                    <button
                        onClick={() => setStep('upiselect')}
                        className="w-full text-center text-gray-500 text-sm py-2"
                    >
                        ← Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FakePayment;