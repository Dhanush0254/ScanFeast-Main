# ScanFeast 🍔 - Smart Contactless Ordering System

ScanFeast is a modern **MERN Stack (MongoDB, Express, React, Node.js)** web application designed to digitize the restaurant dining experience. It replaces traditional paper menus with a **QR-code based ordering system**, complete with a real-time **Kitchen Display System (KDS)** and a powerful **Manager Dashboard**.

---

## 🚀 Features

### 👤 Customer (User)
* **Smart Menu:** Browse food categories with a search bar and "Recommended" items.
* **Cart & Checkout:** Add items, adjust quantities, and view bill details.
* **Order Tracking:** Live status updates (`Placed` → `Accepted` → `Preparing` → `Ready`).
* **Help Desk:** Chat with the manager directly from the order history.
* **Responsive UI:** Mobile-first design with a bottom navigation bar.

### 👨‍🍳 Kitchen (Chef)
* **Live KDS:** Real-time feed of incoming orders sorted by priority (First-In-First-Out).
* **Status Control:** One-tap actions to Accept, Start Cooking, or Mark Ready.
* **Time Management:** Set estimated preparation times (e.g., 15m, 30m).
* **Freshness Logic:** Completed orders vanish from the screen to keep the view clean.

### 🕴️ Manager (Admin)
* **Menu Management:** Add, Edit, or Delete dishes with image URLs and prices.
* **Revenue Wallet:** Track total earnings from completed orders.
* **Rush Mode:** One-click "Rush Hour" button to add a delay time to all active orders.
* **Customer Support:** Reply to customer help desk queries.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), React Router, Axios, CSS Modules (Glassmorphism).
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas (Cloud).
* **Authentication:** JWT (JSON Web Tokens).
* **Icons:** React Icons (`react-icons`).

---

## 📂 Project Structure

```text
/ScanFeast
├── /client             # React Frontend
│   ├── /src
│   │   ├── /components # Navbar, BottomNav
│   │   ├── /pages      # Home, Cart, Orders, Kitchen, Manager, Login
│   │   └── App.jsx     # Routing & Logic
│   └── package.json
│
├── /server             # Node.js Backend
│   ├── /models         # MongoDB Schemas (User, Order, Menu)
│   ├── server.js       # Main API Routes
│   ├── .env            # Environment Variables
│   └── package.json
│
└── README.md
```
⚙️ Installation & Setup
Follow these steps to run the project locally.
1. Prerequisites
 * Node.js installed.
 * MongoDB Atlas Account (for the database).
2. Backend Setup
Open a terminal and navigate to the server folder:
```
cd server
npm install
```
Create a .env file in the server folder and add your credentials:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_random_string
```
Start the Server:
```
node server.js
```
(You should see "Server running on port 5000" and "MongoDB Connected")
3. Frontend Setup
Open a new terminal and navigate to the client folder:
```
cd client
npm install
```
Start the React App:
```
npm run dev
```

(Click the link shown, typically http://localhost:5173)
🔐 Role-Based Login Guide
Since there is no "Sign Up" for Admins/Kitchen (for security), follow these steps to access different dashboards:
1. Manager (Admin) Access
 * Sign up as a new user (e.g., "Manager").
 * Go to your MongoDB Atlas -> users collection.
 * Edit the user document and change "role": "student" to "role": "admin".
 * Log out and Log in again. You will be redirected to the Manager Dashboard.
2. Kitchen (Chef) Access
 * Sign up as a new user (e.g., "Chef John").
 * Go to MongoDB Atlas -> users collection.
 * Change "role": "student" to "role": "kitchen".
 * Log in again. You will be redirected to the Kitchen Display System.
3. Customer Access
 * Just Sign Up! All new accounts are customers by default.
🔮 Future Improvements
 * [ ] Payment Gateway Integration (Razorpay/Stripe).
 * [ ] Push Notifications for Order Ready.
 * [ ] Table QR Code generation from Manager Dashboard.
 * [ ] Chef Analytics (Average preparation time).
       
Made with ❤️ by A Dhanush and T Krishna Koushik 
