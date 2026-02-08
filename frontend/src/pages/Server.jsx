import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { QrReader } from 'react-qr-reader';
import { API_URL, SOCKET_URL } from '../config';

const socket = io(SOCKET_URL);

const Server = () => {
    const [readyOrders, setReadyOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scanning, setScanning] = useState(false);
    const serverName = localStorage.getItem('username') || 'Server';

    useEffect(() => {
        loadReadyOrders();

        const handleKitchenUpdate = (order) => {
            console.log('Kitchen update received:', order);
            if (order.status === 'Ready') {
                toast('🔔 New Order Ready for Delivery!', {
                    duration: 4000,
                    icon: '📦'
                });
                loadReadyOrders();

                // Play notification sound
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUA4PVOXh8bJiHQU2jdXzvoU3Bx1rwO/mnVAOD1Tl4fGxYh4FNo3V876FNwcebc');
                audio.play().catch(() => { });
            }
        };

        // Listen for new ready orders
        socket.on('kitchen_update', handleKitchenUpdate);

        // Debug connection
        socket.on('connect', () => console.log('Server socket connected:', socket.id));

        return () => {
            socket.off('kitchen_update', handleKitchenUpdate);
            socket.off('connect');
        };
    }, []);

    const loadReadyOrders = () => {
        console.log('Fetching ready orders...');
        axios.get(`${API_URL}/api/orders/ready`)
            .then(res => {
                console.log('Ready orders:', res.data);
                setReadyOrders(res.data);
            })
            .catch(err => console.error('Error fetching orders:', err));
    };

    const handleScanOrder = (order) => {
        setSelectedOrder(order);
        setShowScanner(true);
    };

    const handleScan = async (result) => {
        if (result && !scanning) {
            setScanning(true);

            try {
                const scannedData = JSON.parse(result.text);

                // Verify this is the correct order
                if (scannedData.orderId === selectedOrder._id) {
                    // Mark as delivered
                    await axios.post(`${API_URL}/api/orders/${selectedOrder._id}/deliver`, {
                        serverName,
                        serverId: localStorage.getItem('userId')
                    });

                    // Delete from customer history
                    await axios.delete(`${API_URL}/api/orders/${selectedOrder._id}/complete`);

                    toast.success('✅ Order Delivered Successfully!');
                    setShowScanner(false);
                    setSelectedOrder(null);
                    loadReadyOrders();
                } else {
                    toast.error('❌ Wrong QR Code!');
                }
            } catch (err) {
                console.error('Scan error:', err);
                toast.error('Invalid QR Code');
            }

            setTimeout(() => setScanning(false), 2000);
        }
    };

    const handleError = (err) => {
        console.error('Scanner error:', err);
    };

    return (
        <div className="pb-8">
            {/* Header */}
            <div className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold mb-2">🍽️ Server Dashboard</h1>
                <p className="text-blue-100">Ready orders for delivery - {serverName}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-200">
                    <div className="text-3xl mb-1">📦</div>
                    <div className="text-2xl font-bold text-blue-600">{readyOrders.length}</div>
                    <div className="text-sm text-gray-600">Ready to Deliver</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-green-200">
                    <div className="text-3xl mb-1">✅</div>
                    <div className="text-2xl font-bold text-green-600">Active</div>
                    <div className="text-sm text-gray-600">Server Status</div>
                </div>
            </div>

            {/* Ready Orders */}
            <div className="bg-white p-6 rounded-xl shadow-xl">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-3xl">🔔</span>
                    Ready for Delivery ({readyOrders.length})
                </h2>

                {readyOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-8xl mb-4 animate-pulse">⏳</div>
                        <p className="text-xl text-gray-500 font-medium">No orders ready yet</p>
                        <p className="text-gray-400 mt-2">You'll be notified when orders are ready</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {readyOrders.map(order => (
                            <div key={order._id} className="border-2 border-blue-200 bg-blue-50 rounded-xl p-4 hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-bold text-lg">
                                                Table {order.tableNo}
                                            </span>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                                READY
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">₹{order.totalAmount}</div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="mb-3 bg-white p-3 rounded-lg">
                                    <div className="font-bold mb-2 text-sm text-gray-600">Items:</div>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm py-1">
                                            <span>{item.name} x{item.quantity}</span>
                                            <span className="text-gray-600">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Scan Button */}
                                <button
                                    onClick={() => handleScanOrder(order)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:from-blue-700 hover:to-cyan-700 active:scale-95 transition flex items-center justify-center gap-2"
                                >
                                    <span className="text-2xl">📷</span>
                                    Scan QR to Deliver
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scanner Modal */}
            {showScanner && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowScanner(false);
                                setSelectedOrder(null);
                                setScanning(false);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <span className="text-2xl">✖</span>
                        </button>

                        <h2 className="text-2xl font-bold mb-2 text-center">Scan QR Code</h2>
                        <p className="text-center mb-6 text-gray-600">
                            Table {selectedOrder.tableNo} - ₹{selectedOrder.totalAmount}
                        </p>

                        {/* Scanner Area */}
                        <div className="relative mb-6 rounded-xl overflow-hidden border-4 border-blue-500 bg-black">
                            <QrReader
                                onResult={(result, error) => {
                                    if (result) handleScan(result);
                                }}
                                constraints={{ facingMode: 'environment' }}
                                className="w-full"
                            />

                            {/* Scanning Overlay */}
                            <div className="absolute inset-0 border-2 border-white opacity-50 pointer-events-none flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-blue-400 rounded-lg animate-pulse"></div>
                            </div>

                            {/* Processing Overlay */}
                            {scanning && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10">
                                    <div className="text-4xl mb-2 animate-spin">⏳</div>
                                    <div className="font-bold">Processing...</div>
                                </div>
                            )}
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-500">
                                Align the QR code within the frame to confirm delivery.
                            </p>

                            <div className="flex items-center gap-2 mt-2 px-2">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <span className="text-[10px] text-gray-400 font-bold">OR ENTER PIN</span>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="tel"
                                    maxLength={4}
                                    placeholder="Order PIN (e.g. 1234)"
                                    className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-3 text-lg font-bold tracking-widest text-center focus:outline-none focus:border-blue-500"
                                    id="manual-unique-code"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('manual-unique-code');
                                        if (input && input.value === selectedOrder.uniqueCode) {
                                            handleScan({ text: JSON.stringify({ orderId: selectedOrder._id }) });
                                        } else {
                                            toast.error('❌  Invalid PIN');
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 shadow-lg transition active:scale-95"
                                >
                                    Verify Order
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400">
                                Scan QR or enter the 4-digit code shown on the user's screen.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setShowScanner(false);
                                setSelectedOrder(null);
                                setScanning(false);
                            }}
                            className="w-full mt-4 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 active:scale-95 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Server;
