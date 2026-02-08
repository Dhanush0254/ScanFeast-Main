import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config';

const AdminDashboard = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'kitchen', 'servers'
    const [stats, setStats] = useState({ wallet: 0 });
    const [tables, setTables] = useState([]);
    const [needs, setNeeds] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Meals', image: '' });
    const [serverLogs, setServerLogs] = useState([]);

    // Duplicate Kitchen State
    const [kitchenOrders, setKitchenOrders] = useState([]);

    const [refreshTimer, setRefreshTimer] = useState(0);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);

    useEffect(() => {
        fetchData();

        // Sync clock drift
        axios.get(`${API_URL}/api/time`).then(res => {
            const serverTime = new Date(res.data.time).getTime();
            setServerTimeOffset(Date.now() - serverTime);
        });

        const interval = setInterval(() => {
            setRefreshTimer(p => p + 1);
        }, 1000); // Live second timer

        const socket = io(SOCKET_URL);
        socket.on('kitchen_update', (updated) => {
            setKitchenOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
            fetchData(); // Refresh other stats just in case
        });
        socket.on('new_order', (newOrder) => {
            setKitchenOrders(prev => [newOrder, ...prev]);
        });
        socket.on('table_update', fetchData);
        socket.on('need_update', fetchData);
        socket.on('new_emergency', fetchData);

        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, []);

    // Shared timer calculation function with validation
    const getTimeLeft = (order) => {
        if (!order) return 0;
        if (!order.startTime) return 0;

        const start = new Date(order.startTime).getTime();
        if (isNaN(start)) return 0;

        const est = (order.estimatedTime && !isNaN(order.estimatedTime) && order.estimatedTime > 0)
            ? order.estimatedTime
            : 10;
        const delay = (order.delayAdded && !isNaN(order.delayAdded))
            ? order.delayAdded
            : 0;

        const end = start + (est + delay) * 60000;
        const adjustedNow = Date.now() - (serverTimeOffset || 0);
        let left = Math.ceil((end - adjustedNow) / 60000);

        if (isNaN(left)) left = est;

        return left > 0 ? left : 0;
    };

    const fetchData = async () => {
        try {
            const [wRes, tRes, nRes, oRes, lRes] = await Promise.all([
                axios.get(`${API_URL}/api/wallet`),
                axios.get(`${API_URL}/api/tables`),
                axios.get(`${API_URL}/api/needs`),
                axios.get(`${API_URL}/api/orders`),
                axios.get(`${API_URL}/api/server-logs`)
            ]);
            setStats(wRes.data);
            setTables(tRes.data);
            setNeeds(nRes.data);
            setKitchenOrders(oRes.data.filter(o => ['Placed', 'Cooking', 'Accepted'].includes(o.status)));
            setServerLogs(lRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const toggleTable = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Free' ? 'Occupied' : 'Free';
        await axios.put(`${API_URL}/api/tables/${id}`, { status: newStatus });
        toast.success(`Table marked ${newStatus}`);
        fetchData();
    };

    const resolveNeed = async (id) => {
        await axios.put(`${API_URL}/api/needs/${id}`);
        toast.success("Need Resolved");
        fetchData();
    };

    const addItem = async (e) => {
        e.preventDefault();
        await axios.post(`${API_URL}/api/menu`, newItem);
        toast.success("Item Added");
        setNewItem({ name: '', price: '', category: 'Meals', image: '' });
    };

    // Admin Kitchen Action (Delay Only)
    const addDelay = async (id, current) => {
        await axios.put(`${API_URL}/api/orders/${id}`, { delayAdded: (current || 0) + 5 });
        toast.success("Admin Delay Added (+5m)");
        fetchData();
    };

    // --- EMERGENCY LOGIC ---
    const [emergencies, setEmergencies] = useState([]);

    useEffect(() => {
        // Load initial emergencies
        axios.get(`${API_URL}/api/emergency`).then(res => setEmergencies(res.data));

        // Listen for new emergencies
        const socket = io('http://localhost:5000'); // Use direct connection for listener to avoid instance issues
        socket.on('new_emergency', (data) => {
            setEmergencies(prev => [data, ...prev]);
            toast.error(`🚨 EMERGENCY: ${data.type} at Table ${data.tableNo}`, { duration: 10000 });
            // Play alarm sound
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
            audio.play().catch(() => { });
        });

        socket.on('emergency_resolved', (updated) => {
            setEmergencies(prev => prev.filter(e => e._id !== updated._id));
        });

        return () => {
            socket.off('new_emergency');
            socket.off('emergency_resolved');
            socket.disconnect();
        };
    }, []);

    const resolveEmergency = async (id) => {
        await axios.put(`${API_URL}/api/emergency/${id}/resolve`);
        toast.success("Emergency Resolved");
        setEmergencies(prev => prev.filter(e => e._id !== id));
    };

    return (
        <div className="space-y-6 pb-8">
            {/* EMERGENCY ALERTS SECTION */}
            {emergencies.length > 0 && (
                <div className="bg-red-600 text-white p-6 rounded-2xl shadow-xl animate-pulse">
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-4xl">🚨</span> EMERGENCY ALERTS ({emergencies.length})
                    </h2>
                    <div className="grid gap-3">
                        {emergencies.map(e => (
                            <div key={e._id} className="bg-white text-red-900 p-4 rounded-xl flex justify-between items-center shadow-lg">
                                <div>
                                    <p className="font-bold text-2xl uppercase">{e.type}</p>
                                    <p className="text-lg">Table #{e.tableNo}</p>
                                    <p className="text-sm opacity-75">{new Date(e.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <button
                                    onClick={() => resolveEmergency(e._id)}
                                    className="bg-red-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition text-lg"
                                >
                                    RESOLVE ✅
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Header with Toggle */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {view === 'dashboard' ? '📊 Manager Dashboard' : view === 'kitchen' ? '👀 Kitchen Monitor' : '🤵 Server Activity'}
                        </h1>
                        <p className="text-red-100 text-sm">Admin Control Panel</p>
                    </div>
                    <div className="flex gap-2 bg-white/20 backdrop-blur-sm p-1.5 rounded-xl flex-wrap">
                        <button
                            onClick={() => setView('dashboard')}
                            className={`px-4 py-2 rounded-lg font-bold transition flex-1 sm:flex-none ${view === 'dashboard'
                                ? 'bg-white text-red-600 shadow-lg'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setView('kitchen')}
                            className={`px-4 py-2 rounded-lg font-bold transition flex-1 sm:flex-none ${view === 'kitchen'
                                ? 'bg-white text-red-600 shadow-lg'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            Kitchen
                        </button>
                        <button
                            onClick={() => setView('servers')}
                            className={`px-4 py-2 rounded-lg font-bold transition flex-1 sm:flex-none ${view === 'servers'
                                ? 'bg-white text-red-600 shadow-lg'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            Servers
                        </button>
                    </div>
                </div>
            </div>

            {view === 'dashboard' ? (
                <>
                    {/* Revenue & Alerts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Wallet */}
                        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-8 rounded-2xl shadow-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-4xl">💰</span>
                                <h3 className="text-lg text-green-100">Total Revenue</h3>
                            </div>
                            <p className="text-5xl font-bold mt-2">₹{stats.wallet || 0}</p>
                            <p className="text-green-100 text-sm mt-2">From all orders</p>
                        </div>

                        {/* Kitchen Needs/Alerts */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-red-100">
                            <h3 className="font-bold text-xl text-red-600 mb-4 flex items-center gap-2">
                                <span>⚠️</span> Kitchen Alerts
                            </h3>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {needs.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">No alerts. All good! ✅</p>
                                ) : (
                                    needs.map(n => (
                                        <div key={n._id} className="flex justify-between items-center bg-red-50 p-3 rounded-xl border border-red-200">
                                            <span className="font-medium">{n.item}</span>
                                            <button
                                                onClick={() => resolveNeed(n._id)}
                                                className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-600"
                                            >
                                                Resolve ✓
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table Status */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl">
                        <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                            <span>🪑</span> Table Status (Click to Toggle)
                        </h3>
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                            {tables.map(t => (
                                <button
                                    key={t._id}
                                    onClick={() => toggleTable(t._id, t.status)}
                                    className={`aspect-square p-4 rounded-xl font-bold text-center transition transform hover:scale-105 active:scale-95 ${t.status === 'Free'
                                        ? 'bg-green-100 text-green-800 border-3 border-green-500 shadow-green-200'
                                        : 'bg-red-100 text-red-800 border-3 border-red-500 shadow-red-200'
                                        } shadow-lg`}
                                >
                                    <div className="text-2xl mb-1">{t.status === 'Free' ? '✓' : '✗'}</div>
                                    <div className="text-lg">{t.tableNo}</div>
                                    <div className="text-xs mt-1">{t.status}</div>
                                </button>
                            ))}
                        </div>
                    </div>


                </>
            ) : view === 'kitchen' ? (
                /* DUPLICATE KITCHEN VIEW (Read-only with Delay button) */
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                        <span>🍳</span> Active Kitchen Orders
                    </h3>
                    {kitchenOrders.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">No active orders in kitchen.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {kitchenOrders.map(order => (
                                <div key={order._id} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-300 shadow-lg">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-lg">Table {order.tableNo}</h4>
                                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-bold">
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 mb-4 space-y-1">
                                        {order.items.map((i, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-blue-500">•</span>
                                                <span>{i.name}</span>
                                                {i.qty > 1 && <span className="text-xs bg-gray-200 px-1.5 rounded">x{i.qty}</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center mb-3 bg-white rounded-lg p-2">
                                        <span className="text-2xl font-bold text-orange-600">
                                            {(() => {
                                                const timeLeft = getTimeLeft(order);
                                                return timeLeft > 0 ? `${timeLeft} mins left` : 'Nearly Ready! 🍴';
                                            })()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => addDelay(order._id, order.delayAdded)}
                                        className="w-full bg-yellow-100 text-yellow-800 py-2.5 rounded-lg font-bold hover:bg-yellow-200 border-2 border-yellow-300 transition"
                                    >
                                        ⏱️ Add +5 Min Delay
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* SERVER ACTIVITY VIEW */
                <div className="bg-white p-6 rounded-2xl shadow-xl">
                    <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                        <span>🤵</span> Server Activity & Order History
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {serverLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                            No recent server activity.
                                        </td>
                                    </tr>
                                ) : (
                                    serverLogs.map((log, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.action === 'Delivery' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;