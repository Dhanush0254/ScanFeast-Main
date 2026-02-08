import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('cart')) || [];
        const formatted = stored.map(i => ({ ...i, qty: i.qty || 1 }));
        setCart(formatted);
    }, []);

    const updateQty = (idx, delta) => {
        const newCart = [...cart];
        newCart[idx].qty += delta;
        if (newCart[idx].qty <= 0) {
            newCart.splice(idx, 1);
            toast.success('Item removed');
        }
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
        toast.success('Cart cleared');
    };

    const itemTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const tax = Math.round(itemTotal * 0.05); // 5% tax
    const grandTotal = itemTotal;

    return (
        <div className="max-w-2xl mx-auto bg-white min-h-screen">
            <div className="sticky top-16 bg-white z-10 py-4 border-b">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Your Cart 🛒</h1>
                    {cart.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="text-red-500 text-sm font-bold hover:underline"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-20 text-center p-4">
                    <div className="text-8xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Cart is Empty</h2>
                    <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600"
                    >
                        Browse Menu
                    </button>
                </div>
            ) : (
                <div className="p-4">
                    <div className="space-y-4 mb-6">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.image || "https://via.placeholder.com/100"}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg truncate">{item.name}</h3>
                                    <p className="text-gray-600">₹{item.price} each</p>
                                    <p className="text-sm text-green-600 font-bold mt-1">
                                        Subtotal: ₹{item.price * item.qty}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-3 bg-white rounded-lg p-1 border-2 border-gray-300 shadow-sm">
                                        <button
                                            onClick={() => updateQty(idx, -1)}
                                            className="w-10 h-10 font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:scale-95 transition"
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-xl w-8 text-center">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(idx, 1)}
                                            className="w-10 h-10 font-bold bg-green-50 text-green-600 rounded-lg hover:bg-green-100 active:scale-95 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6 mb-6">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Bill Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span>Item Total ({cart.reduce((acc, i) => acc + i.qty, 0)} items)</span>
                                <span className="font-bold">₹{itemTotal}</span>
                            </div>
                            <div className="border-t-2 border-orange-200 pt-3 flex justify-between text-xl font-bold text-gray-900">
                                <span>Grand Total</span>
                                <span className="text-green-600">₹{grandTotal}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/payment')}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:from-green-700 hover:to-green-800 active:scale-98 transition"
                    >
                        Proceed to Pay ₹{grandTotal}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;