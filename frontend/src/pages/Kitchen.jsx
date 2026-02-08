import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { API_URL, SOCKET_URL } from '../config';

const socket = io(SOCKET_URL);

const Kitchen = () => {
    const [orders, setOrders] = useState([]);
    const [needsItem, setNeedsItem] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [timers, setTimers] = useState({});
    const [refreshTimer, setRefreshTimer] = useState(0);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);

    useEffect(() => {
        // Sync clock drift
        axios.get(`${API_URL}/api/time`).then(res => {
            const serverTime = new Date(res.data.time).getTime();
            setServerTimeOffset(Date.now() - serverTime);
        });

        const interval = setInterval(() => {
            setRefreshTimer(prev => prev + 1);
        }, 1000); // Update every second for live feel
        return () => clearInterval(interval);
    }, []);

    // Shared timer calculation function with validation
    const getTimeLeft = (order) => {
        if (!order) return 0;
        if (!order.startTime) {
            console.warn(`[Timer] Order ${order._id} missing startTime`);
            return 0;
        }

        const start = new Date(order.startTime).getTime();
        if (isNaN(start)) {
            console.warn(`[Timer] Order ${order._id} has invalid startTime:`, order.startTime);
            return 0;
        }

        const est = (order.estimatedTime && !isNaN(order.estimatedTime) && order.estimatedTime > 0)
            ? order.estimatedTime
            : 10;
        const delay = (order.delayAdded && !isNaN(order.delayAdded))
            ? order.delayAdded
            : 0;

        const end = start + (est + delay) * 60000;
        const adjustedNow = Date.now() - (serverTimeOffset || 0);
        let left = Math.ceil((end - adjustedNow) / 60000);

        if (isNaN(left)) {
            console.warn(`[Timer] Order ${order._id} calculation resulted in NaN. Using estimated time as fallback.`);
            left = est;
        }

        return left > 0 ? left : 0;
    };

    useEffect(() => {
        axios.get(`${API_URL}/api/orders`).then(res => setOrders(res.data));

        socket.on('new_order', (o) => {
            toast('🔔 New Order Arrived!', { duration: 4000 });
            setOrders(p => [o, ...p]);
        });

        socket.on('kitchen_update', (o) => setOrders(p => p.map(x => x._id === o._id ? o : x)));

        return () => {
            socket.off('new_order');
            socket.off('kitchen_update');
        };
    }, []);

    // Request notification permission
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const pending = orders.filter(o => o.status === 'Placed');
    const running = orders.filter(o => ['Cooking', 'Accepted'].includes(o.status));

    // Auto-complete timer
    useEffect(() => {
        const intervals = {};

        running.forEach(order => {
            if (!order.startTime) return;

            const endTime = new Date(order.startTime).getTime() + (order.estimatedTime + (order.delayAdded || 0)) * 60000;
            const interval = setInterval(() => {
                const now = Date.now();
                const timeLeft = Math.ceil((endTime - now) / 1000);

                if (timeLeft <= 0 && order.status !== 'Ready') {
                    // Auto mark as ready
                    axios.put(`${API_URL}/api/orders/${order._id}`, { status: 'Ready' });
                    toast.success(`Order for Table ${order.tableNo} is Ready! 🎉`, { duration: 5000 });
                    clearInterval(interval);

                    // Browser notification
                    if (Notification.permission === 'granted') {
                        new Notification('Order Ready!', {
                            body: `Table ${order.tableNo} order is complete`,
                            icon: '🎉'
                        });
                    }
                }
            }, 1000);

            intervals[order._id] = interval;
        });

        return () => {
            Object.values(intervals).forEach(clearInterval);
        };
    }, [running]);

    const acceptOrder = async (order) => {
        await axios.put(`${API_URL}/api/orders/${order._id}`, {
            status: 'Cooking'
        });
        toast.success(`Started cooking!`);
    };

    const addDelay = async (id, cur) => {
        await axios.put(`${API_URL}/api/orders/${id}`, { delayAdded: (cur || 0) + 5 });
        toast.success("Delay Added (+5m)");
    };

    const markReady = async (id) => {
        const order = await axios.put(`${API_URL}/api/orders/${id}`, { status: 'Ready' });
        toast.success("Order Ready! Server Notified 📦");
    };

    const reportNeed = async () => {
        if (!needsItem.trim()) {
            toast.error("Enter item name");
            return;
        }
        await axios.post(`${API_URL}/api/needs`, { item: needsItem });
        toast.success("Reported to Manager");
        setNeedsItem('');
    };

    const rejectOrder = async () => {
        if (!rejectReason.trim()) {
            toast.error("Please enter rejection reason");
            return;
        }

        await axios.put(`${API_URL}/api/orders/${showRejectModal}/reject`, { reason: rejectReason });
        toast.error("Order Rejected");
        setShowRejectModal(null);
        setRejectReason('');
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Kitchen Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <span className="text-4xl">👨‍🍳</span>
                            Kitchen Live
                        </h1>
                        <p className="text-gray-300 text-sm">Real-time Order Management</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            className="flex-1 md:w-64 text-black p-3 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                            placeholder="Report shortage (e.g., Onions)"
                            value={needsItem}
                            onChange={e => setNeedsItem(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && reportNeed()}
                        />
                        <button
                            onClick={reportNeed}
                            className="bg-red-500 px-6 rounded-xl font-bold hover:bg-red-600 shadow-lg transition"
                        >
                            Alert Manager
                        </button>
                    </div>
                </div>
            </div>

            {/* INCOMING QUEUE */}
            {pending.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-3 border-orange-400 p-6 rounded-2xl shadow-xl">
                    <h2 className="text-orange-800 font-bold text-2xl mb-5 flex items-center gap-2 animate-pulse">
                        <span className="text-3xl">🔔</span>
                        Incoming Orders ({pending.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pending.map(o => (
                            <div key={o._id} className="bg-white p-5 rounded-xl shadow-lg border-2 border-orange-300 hover:shadow-xl transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="font-bold text-xl">Table {o.tableNo}</span>
                                        <p className="text-xs text-gray-500 mt-1">Order #{o._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-bold">
                                        NEW
                                    </span>
                                </div>
                                <div className="text-sm mb-4 space-y-1">
                                    {o.items.map((i, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="text-orange-500">•</span>
                                            <span className="font-medium">{i.name}</span>
                                            {i.qty > 1 && <span className="text-xs bg-gray-200 px-1.5 rounded">x{i.qty}</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => acceptOrder(o)}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:from-green-700 hover:to-green-800 active:scale-95 transition"
                                    >
                                        ✅ ACCEPT
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(o._id)}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:from-red-700 hover:to-red-800 active:scale-95 transition"
                                    >
                                        ❌ REJECT
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* RUNNING ORDERS */}
            <div>
                <h2 className="font-bold text-2xl mb-5 flex items-center gap-2">
                    <span className="text-3xl">🔥</span>
                    Cooking Now ({running.length})
                </h2>
                {running.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center">
                        <div className="text-6xl mb-3">🍳</div>
                        <p className="text-gray-500 font-medium">No orders being prepared</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {running.map(o => (
                            <div key={o._id} className="bg-white border-l-8 border-green-500 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="font-bold text-2xl">Table {o.tableNo}</h3>
                                            <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold">
                                                {o.status}
                                            </span>
                                        </div>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                            {o.items.map((i, x) => (
                                                <li key={x} className="flex items-center gap-2">
                                                    <span className="text-green-500">▸</span>
                                                    <span className="font-medium">{i.name}</span>
                                                    {i.qty > 1 && <span className="text-xs bg-gray-200 px-1.5 rounded">x{i.qty}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Timer */}
                                    <div className="text-center bg-gradient-to-br from-orange-100 to-yellow-100 px-6 py-4 rounded-xl border-2 border-orange-300">
                                        <div className="text-4xl font-bold text-orange-600">
                                            {getTimeLeft(o)}
                                        </div>
                                        <span className="text-xs text-orange-700 font-medium tracking-tight">
                                            {getTimeLeft(o) > 0 ? 'mins left' : 'OVERDUE / READY'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => addDelay(o._id, o.delayAdded)}
                                            className="px-6 py-2 bg-yellow-100 text-yellow-800 rounded-xl text-sm font-bold border-2 border-yellow-300 hover:bg-yellow-200 transition"
                                        >
                                            ⏱️ Add +5 Min
                                        </button>
                                        <button
                                            onClick={() => markReady(o._id)}
                                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold shadow-lg hover:from-green-700 hover:to-green-800 active:scale-95 transition"
                                        >
                                            ✅ MARK READY
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 text-red-600">❌ Reject Order</h2>
                        <p className="mb-4 text-gray-700">Please enter a reason for rejection:</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 mb-4"
                            rows="4"
                            placeholder="e.g., Out of stock ingredients"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={rejectOrder}
                                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 active:scale-95 transition"
                            >
                                Confirm Reject
                            </button>
                            <button
                                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-400 active:scale-95 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kitchen;