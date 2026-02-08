const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// --- SCHEMAS ---
const menuSchema = new mongoose.Schema({
    name: String, category: String, price: Number, image: String,
    timeOfDay: [String], isSpecial: Boolean, stock: { type: Number, default: 50 }
});
const Menu = mongoose.model('Menu', menuSchema);

const orderSchema = new mongoose.Schema({
    tableNo: Number, items: Array, totalAmount: Number,
    status: { type: String, default: 'Placed' }, // Placed, Accepted, Cooking, Ready, Completed
    estimatedTime: { type: Number, default: 0 },
    startTime: Date, delayAdded: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    uniqueCode: { type: String }
});
const Order = mongoose.model('Order', orderSchema);

const userSchema = new mongoose.Schema({
    username: String, password: String, role: String, // ADMIN, KITCHEN, USER
    wallet: { type: Number, default: 0 } // Admin Wallet
});
const User = mongoose.model('User', userSchema);

const needSchema = new mongoose.Schema({ item: String, status: { type: String, default: 'Pending' } });
const KitchenNeed = mongoose.model('KitchenNeed', needSchema);

const tableSchema = new mongoose.Schema({ tableNo: Number, status: { type: String, default: 'Free' } }); // Free, Occupied
const Table = mongoose.model('Table', tableSchema);

const faqSchema = new mongoose.Schema({
    question: String,
    answer: String,
    category: { type: String, default: 'General' },
    createdAt: { type: Date, default: Date.now }
});
const FAQ = mongoose.model('FAQ', faqSchema);

const emergencySchema = new mongoose.Schema({
    tableNo: Number,
    type: { type: String, enum: ['Medical', 'Fire', 'Poisoned Food', 'Other'] },
    status: { type: String, default: 'Pending' }, // Pending, Resolved
    createdAt: { type: Date, default: Date.now }
});
const Emergency = mongoose.model('Emergency', emergencySchema);

const categorySchema = new mongoose.Schema({
    name: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
});
const Category = mongoose.model('Category', categorySchema);


const serverLogSchema = new mongoose.Schema({
    serverName: String,
    serverId: String,
    tableNo: Number,
    orderId: String,
    action: { type: String, enum: ['delivered', 'scanned'] },
    createdAt: { type: Date, default: Date.now }
});
const ServerLog = mongoose.model('ServerLog', serverLogSchema);

// --- SERVER SETUP ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

const DB_URI = "mongodb+srv://ScanFeast:23K91A0501@cluster0.hvrwr5x.mongodb.net/scanfeast_db?retryWrites=true&w=majority";
mongoose.connect(DB_URI).then(() => console.log('✅ DB Connected'));

// --- REAL-TIME ---
io.on('connection', (socket) => { console.log('Connected:', socket.id); });

// --- ROUTES ---

// Auth
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "Invalid" });
    res.json(user);
});

// Menu
app.get('/api/menu', async (req, res) => res.json(await Menu.find()));
app.post('/api/menu', async (req, res) => res.json(await new Menu(req.body).save()));
app.delete('/api/menu/:id', async (req, res) => res.json(await Menu.findByIdAndDelete(req.params.id)));

// Orders
app.get('/api/orders', async (req, res) => res.json(await Order.find().sort({ createdAt: -1 })));
app.post('/api/orders', async (req, res) => {
    // Generate unique 4-digit code
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        const existing = await Order.findOne({ uniqueCode: code, status: { $ne: 'Completed' } });
        if (!existing) isUnique = true;
    }

    const order = new Order({ ...req.body, uniqueCode: code });
    await order.save();

    // Mark Table as Occupied
    await Table.findOneAndUpdate({ tableNo: req.body.tableNo }, { status: 'Occupied' }, { upsert: true });

    // Add to Admin Wallet (Simulated immediate transfer on order)
    await User.findOneAndUpdate({ role: 'ADMIN' }, { $inc: { wallet: req.body.totalAmount } });

    io.emit('new_order', order);
    io.emit('table_update');
    res.json(order);
});
app.put('/api/orders/:id', async (req, res) => {
    const { status, delayAdded } = req.body;
    let updateData = {};
    if (status) updateData.status = status;

    // Get current order state
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Handle transition to Cooking/Accepted
    if (status === 'Accepted' || status === 'Cooking') {
        updateData.status = 'Cooking';

        // Only set startTime once, but validate it's not invalid
        if (!order.startTime || isNaN(new Date(order.startTime).getTime())) {
            updateData.startTime = new Date();

            // Smart Timing calculation
            const txt = JSON.stringify(order.items).toLowerCase();
            let time = 10; // Default
            if (txt.includes('meal') || txt.includes('biryani') || txt.includes('lunch') || txt.includes('dinner')) time = 15;
            if (txt.includes('samosa') || txt.includes('tea') || txt.includes('snack') || txt.includes('coffee')) time = 5;
            updateData.estimatedTime = time;
            console.log(`[Timer Start] Order ${order._id} - ${time} mins`);
        } else {
            // Validate existing estimatedTime
            if (!order.estimatedTime || isNaN(order.estimatedTime) || order.estimatedTime <= 0) {
                const txt = JSON.stringify(order.items).toLowerCase();
                let time = 10;
                if (txt.includes('meal') || txt.includes('biryani') || txt.includes('lunch') || txt.includes('dinner')) time = 15;
                if (txt.includes('samosa') || txt.includes('tea') || txt.includes('snack') || txt.includes('coffee')) time = 5;
                updateData.estimatedTime = time;
                console.log(`[Timer Fix] Order ${order._id} - Fixed estimatedTime to ${time} mins`);
            }
        }
    }

    if (delayAdded !== undefined) {
        updateData.delayAdded = delayAdded;
    }

    const updated = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    console.log(`[Timer Status] Order ${updated._id} - Status: ${updated.status}, Start: ${updated.startTime}, Est: ${updated.estimatedTime}, Delay: ${updated.delayAdded}`);


    // Print to terminal when Ready
    if (status === 'Ready') {
        console.log('\n================================');
        console.log('       KITCHEN RECEIPT');
        console.log('================================');
        console.log(`Order ID: ${updated._id}`);
        console.log(`Table No: ${updated.tableNo}`);
        console.log('--------------------------------');
        updated.items.forEach(item => {
            console.log(`${item.name} x${item.quantity}   ₹${item.price * item.quantity}`);
        });
        console.log('--------------------------------');
        console.log(`TOTAL AMOUNT: ₹${updated.totalAmount}`);
        console.log(`Time: ${new Date().toLocaleTimeString()}`);
        console.log('================================\n');
    }

    io.emit(`order_update_${updated.tableNo}`, updated);
    io.emit('kitchen_update', updated);
    res.json(updated);
});

// Tables
app.get('/api/tables', async (req, res) => res.json(await Table.find().sort({ tableNo: 1 })));
app.put('/api/tables/:id', async (req, res) => {
    const t = await Table.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    io.emit('table_update');
    res.json(t);
});

// Needs
app.get('/api/needs', async (req, res) => res.json(await KitchenNeed.find({ status: 'Pending' })));
app.post('/api/needs', async (req, res) => {
    const n = new KitchenNeed(req.body);
    await n.save();
    io.emit('need_update');
    res.json(n);
});
app.put('/api/needs/:id', async (req, res) => res.json(await KitchenNeed.findByIdAndUpdate(req.params.id, { status: 'Resolved' })));

// Wallet
app.get('/api/wallet', async (req, res) => {
    const admin = await User.findOne({ role: 'ADMIN' });
    res.json({ wallet: admin ? admin.wallet : 0 });
});

// FAQ
app.get('/api/faqs', async (req, res) => res.json(await FAQ.find().sort({ createdAt: -1 })));
app.post('/api/faqs', async (req, res) => res.json(await new FAQ(req.body).save()));
app.delete('/api/faqs/:id', async (req, res) => res.json(await FAQ.findByIdAndDelete(req.params.id)));

// Emergency
app.get('/api/emergency', async (req, res) => res.json(await Emergency.find({ status: 'Pending' }).sort({ createdAt: -1 })));
app.post('/api/emergency', async (req, res) => {
    const emergency = new Emergency(req.body);
    await emergency.save();
    io.emit('new_emergency', emergency);
    res.json(emergency);
});
app.put('/api/emergency/:id/resolve', async (req, res) => {
    const e = await Emergency.findByIdAndUpdate(req.params.id, { status: 'Resolved' }, { new: true });
    io.emit('emergency_resolved', e);
    res.json(e);
});

// Categories
app.get('/api/categories', async (req, res) => res.json(await Category.find().sort({ name: 1 })));
app.post('/api/categories', async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.json(category);
    } catch (e) {
        res.status(400).json({ error: "Category already exists" });
    }
});

// Order Rejection
app.put('/api/orders/:id/reject', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: 'Rejected',
        rejectionReason: req.body.reason
    }, { new: true });
    io.emit(`order_update_${order.tableNo}`, order);
    io.emit('kitchen_update', order);
    io.emit('order_rejected', order);
    res.json(order);
});

// Clear orders when table is marked empty
app.delete('/api/orders/table/:tableNo', async (req, res) => {
    await Order.deleteMany({ tableNo: req.params.tableNo });
    res.json({ success: true });
});

// Server Endpoints
app.get('/api/orders/ready', async (req, res) => {
    const readyOrders = await Order.find({ status: 'Ready' }).sort({ createdAt: 1 });
    res.json(readyOrders);
});

app.post('/api/orders/:id/deliver', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: 'Delivered',
        deliveredAt: new Date()
    }, { new: true });

    // Log server activity
    await new ServerLog({
        serverName: req.body.serverName,
        serverId: req.body.serverId,
        tableNo: order.tableNo,
        orderId: order._id,
        action: 'delivered'
    }).save();

    // Cap at 5 entries as requested
    const count = await ServerLog.countDocuments();
    if (count > 5) {
        const oldest = await ServerLog.find().sort({ createdAt: 1 }).limit(count - 5);
        await ServerLog.deleteMany({ _id: { $in: oldest.map(l => l._id) } });
    }

    io.emit(`order_update_${order.tableNo}`, order);
    io.emit('order_delivered', order);
    res.json(order);
});

app.delete('/api/orders/:id/complete', async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.get('/api/server-logs', async (req, res) => {
    const logs = await ServerLog.find().sort({ createdAt: -1 }).limit(5);
    res.json(logs);
});

app.get('/api/time', (req, res) => res.json({ time: new Date() }));

// Fix existing zero-time orders - Enhanced version
app.get('/api/admin/fix-timers', async (req, res) => {
    try {
        // Find all orders in Cooking or Accepted status
        const orders = await Order.find({ status: { $in: ['Cooking', 'Accepted'] } });

        let fixedCount = 0;
        const fixedOrders = [];

        for (let o of orders) {
            let needsFix = false;
            const issues = [];

            // Check if startTime is missing or invalid
            if (!o.startTime) {
                needsFix = true;
                issues.push('missing startTime');
                o.startTime = new Date();
            } else {
                const startTimeValue = new Date(o.startTime).getTime();
                if (isNaN(startTimeValue)) {
                    needsFix = true;
                    issues.push('invalid startTime');
                    o.startTime = new Date();
                }
            }

            // Check if estimatedTime is missing or invalid
            if (!o.estimatedTime || isNaN(o.estimatedTime) || o.estimatedTime <= 0) {
                needsFix = true;
                issues.push('invalid estimatedTime');

                // Smart timing based on order items
                const txt = JSON.stringify(o.items).toLowerCase();
                let time = 10; // Default
                if (txt.includes('meal') || txt.includes('biryani') || txt.includes('lunch') || txt.includes('dinner')) time = 15;
                if (txt.includes('samosa') || txt.includes('tea') || txt.includes('snack') || txt.includes('coffee')) time = 5;
                o.estimatedTime = time;
            }

            // Ensure delayAdded is a valid number
            if (isNaN(o.delayAdded)) {
                needsFix = true;
                issues.push('invalid delayAdded');
                o.delayAdded = 0;
            }

            if (needsFix) {
                await o.save();
                fixedCount++;
                fixedOrders.push({
                    orderId: o._id,
                    tableNo: o.tableNo,
                    issues: issues,
                    newStartTime: o.startTime,
                    newEstimatedTime: o.estimatedTime
                });
                console.log(`[Timer Fixed] Order ${o._id} - Table ${o.tableNo} - Issues: ${issues.join(', ')}`);
            }
        }

        // Broadcast update to all clients
        io.emit('kitchen_update', { type: 'timers_fixed', count: fixedCount });

        res.json({
            success: true,
            fixed: fixedCount,
            totalChecked: orders.length,
            details: fixedOrders
        });
    } catch (error) {
        console.error('[Timer Fix Error]', error);
        res.status(500).json({ error: 'Failed to fix timers', message: error.message });
    }
});

server.listen(5000, () => console.log('🚀 Server 5000'));