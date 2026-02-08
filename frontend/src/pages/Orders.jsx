import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL, SOCKET_URL } from '../config';

const socket = io(SOCKET_URL);

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const navigate = useNavigate();
    const tableNo = localStorage.getItem('tableNo');

    useEffect(() => {
        if (!tableNo) {
            navigate('/home');
            return;
        }

        // Sync with server time to avoid "0 mins" due to clock drift
        axios.get(`${API_URL}/api/time`).then(res => {
            const serverTime = new Date(res.data.time).getTime();
            setServerTimeOffset(Date.now() - serverTime);
        });

        const fetchOrders = () => {
            axios.get(`${API_URL}/api/orders`).then(res => {
                setOrders(res.data.filter(o => o.tableNo == tableNo));
            });
        };

        fetchOrders();
        const poll = setInterval(fetchOrders, 10000); // 10s fallback poll

        socket.on(`order_update_${tableNo}`, (updatedOrder) => {
            setOrders(prev => {
                const exists = prev.find(o => o._id === updatedOrder._id);
                if (exists) return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
                return [updatedOrder, ...prev];
            });
        });

        return () => {
            socket.off(`order_update_${tableNo}`);
            clearInterval(poll);
        };
    }, [tableNo, navigate]);

    const [refreshTimer, setRefreshTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshTimer(prev => prev + 1);
        }, 1000); // Update every second for live feel
        return () => clearInterval(interval);
    }, []);

    const getTimeLeft = (order) => {
        // Validate order has required fields
        if (!order) return 0;
        if (!order.startTime) {
            console.warn(`[Timer] Order ${order._id} missing startTime`);
            return 0;
        }

        // Validate startTime is a valid date
        const start = new Date(order.startTime).getTime();
        if (isNaN(start)) {
            console.warn(`[Timer] Order ${order._id} has invalid startTime:`, order.startTime);
            return 0;
        }

        // Get estimated time and delay with safe defaults
        const est = (order.estimatedTime && !isNaN(order.estimatedTime) && order.estimatedTime > 0)
            ? order.estimatedTime
            : 10;
        const delay = (order.delayAdded && !isNaN(order.delayAdded))
            ? order.delayAdded
            : 0;

        // Calculate end time
        const end = start + (est + delay) * 60000;

        // Adjust client time to match server time (default to 0 if sync failed)
        const adjustedNow = Date.now() - (serverTimeOffset || 0);
        let left = Math.ceil((end - adjustedNow) / 60000);

        // Handle NaN result
        if (isNaN(left)) {
            console.warn(`[Timer] Order ${order._id} calculation resulted in NaN. Using estimated time as fallback.`);
            left = est;
        }

        return left > 0 ? left : 0;
    };

    const getStatusColor = (status) => {
        const colors = {
            'Placed': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Accepted': 'bg-blue-100 text-blue-800 border-blue-300',
            'Cooking': 'bg-orange-100 text-orange-800 border-orange-300',
            'Ready': 'bg-green-100 text-green-800 border-green-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusEmoji = (status) => {
        const emojis = {
            'Placed': '📝',
            'Accepted': '✅',
            'Cooking': '🍳',
            'Ready': '🎉'
        };
        return emojis[status] || '📦';
    };

    // --- EMERGENCY LOGIC ---
    const [showSOS, setShowSOS] = useState(false);

    const handleEmergency = async (type) => {
        try {
            await axios.post(`${API_URL}/api/emergency`, {
                tableNo,
                type,
                status: 'Pending'
            });
            setShowSOS(false);
            alert('🚨 EMERGENCY ALERT SENT TO MANAGER! HELP IS ON THE WAY.');
        } catch (error) {
            alert('Failed to send alert. Please call for help!');
        }
    };

    return (
        <div className="pb-24 md:pb-8 relative">
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Your Orders</h2>
                    <p className="text-blue-100">Table #{tableNo}</p>
                </div>
                <button
                    onClick={() => setShowSOS(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg animate-pulse hover:bg-red-700 border-2 border-red-400"
                >
                    🚨 SOS / HELP
                </button>
            </div>

            {/* SOS MODAL */}
            {showSOS && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-red-600 text-white p-4 text-center">
                            <h2 className="text-2xl font-bold">⚠️ EMERGENCY ALERT</h2>
                            <p className="text-sm">Manager will be notified immediately</p>
                        </div>
                        <div className="p-6 grid gap-3">
                            {['Poisoned / Expired Food', 'Medical Emergency', 'Fire / Safety', 'Other'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleEmergency(type)}
                                    className="p-4 bg-red-50 border-2 border-red-100 rounded-xl font-bold text-red-700 hover:bg-red-100 hover:border-red-300 text-left flex justify-between items-center"
                                >
                                    {type}
                                    <span>⚠️</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setShowSOS(false)}
                                className="mt-2 p-3 bg-gray-200 text-gray-800 rounded-xl font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {orders.length === 0 && (
                <div className="text-center mt-20 p-4">
                    <div className="text-8xl mb-4">🍽️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
                    <p className="text-gray-500 mb-6">Place your first order to see it here!</p>
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600"
                    >
                        Browse Menu
                    </button>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {orders.map(order => {
                    const timeLeft = getTimeLeft(order);
                    const statusColor = getStatusColor(order.status);
                    const statusEmoji = getStatusEmoji(order.status);

                    return (
                        <div key={order._id} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-xl transition">
                            {/* Status Header */}
                            <div className={`${statusColor} border-b-2 p-4 flex justify-between items-center`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{statusEmoji}</span>
                                    <span className="font-bold text-lg">{order.status}</span>
                                </div>
                                <span className="text-xs font-bold bg-white/50 px-3 py-1 rounded-full">
                                    #{order._id.slice(-6).toUpperCase()}
                                </span>
                            </div>

                            {/* Order Details */}
                            <div className="p-5">
                                <div className="mb-4 pb-4 border-b">
                                    <h3 className="font-bold text-gray-600 mb-3 flex items-center gap-2">
                                        <span>📋</span> Order Items
                                    </h3>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between py-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{item.name}</span>
                                                {item.qty && item.qty > 1 && (
                                                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                                                        x{item.qty}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-bold text-gray-700">₹{item.price * (item.qty || 1)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-green-600">₹{order.totalAmount}</span>
                                    </div>
                                </div>

                                {/* Status-specific content */}
                                {order.status === 'Placed' && (
                                    <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl text-center">
                                        <div className="text-3xl mb-2">⏳</div>
                                        <p className="font-bold text-yellow-800">Waiting for kitchen to accept...</p>
                                    </div>
                                )}

                                {order.status === 'Accepted' && (
                                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl text-center">
                                        <div className="text-3xl mb-2 animate-pulse">👨‍🍳</div>
                                        <p className="font-bold text-blue-800 mb-1">Being Prepared</p>
                                        <p className="text-2xl font-bold text-blue-600 animate-pulse">
                                            {timeLeft > 0 ? `${timeLeft} mins remaining` : 'Almost there!'}
                                        </p>
                                        <button
                                            onClick={async () => {
                                                await axios.get(`${API_URL}/api/admin/fix-timers`);
                                                window.location.reload();
                                            }}
                                            className="text-[10px] text-blue-400 mt-2 opacity-30 hover:opacity-100"
                                        >
                                            🔄 Sync Timer
                                        </button>
                                    </div>
                                )}

                                {order.status === 'Cooking' && (
                                    <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl text-center">
                                        <div className="text-3xl mb-2 animate-bounce">🔥</div>
                                        <p className="font-bold text-orange-800 mb-1">Cooking Now!</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {timeLeft > 0 ? `${timeLeft} mins left` : 'Nearly Ready! 🍴'}
                                        </p>
                                        <button
                                            onClick={async () => {
                                                await axios.get(`${API_URL}/api/admin/fix-timers`);
                                                window.location.reload();
                                            }}
                                            className="text-[10px] text-orange-400 mt-2 opacity-30 hover:opacity-100"
                                        >
                                            🔄 Sync Timer
                                        </button>
                                    </div>
                                )}

                                {order.status === 'Ready' && (
                                    <div className="text-center">
                                        <div className="bg-green-50 border-2 border-green-300 p-4 rounded-xl mb-4">
                                            <div className="text-4xl mb-2">✅</div>
                                            <p className="font-bold text-green-800 text-lg">Ready to Serve!</p>
                                            <p className="text-sm text-green-600 mt-1">Show QR code to server</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER_${order._id}`}
                                                alt="QR Code"
                                                className="mx-auto w-48 h-48"
                                            />
                                            <p className="text-4xl font-bold text-gray-800 mt-3 font-mono tracking-widest">
                                                {order.uniqueCode || <span className="text-sm text-gray-400">Scan Only</span>}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Orders;