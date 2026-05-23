# 🛒 Smart Grocery Sri Lanka

Smart Grocery Sri Lanka is a production-grade multi-supermarket marketplace and real-time delivery platform. It enables users to browse items, search across major retailers, compare live item pricing sheets, check budget solutions, checkout using simulated wallets, and track delivery routes in real-time.

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Recharts, Context API, Axios, Socket.io Client, Lucide Icons.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT Authentication.

---

## 🚀 Key Modules
1. **Multi-Supermarket Marketplace**: Real-time catalogues for **Keells**, **Cargills Food City**, **SPAR Sri Lanka**, and **Laugfs Supermarket**.
2. **Live Price Comparison Engine**: Dynamically displays prices for each item side-by-side across stores, highlighting the cheapest store and stock counts.
3. **Smart Budget Shopping Planner**: Knapsack-like optimization suggestion suggesting the cheapest supermarket checklist match that fits a customer's specific budget.
4. **Simulated Live Order Tracking**: Animated grid streets map updating coordinates via Socket.io channels with simulated driving vector.
5. **Role Dashboards**: Fully customized admin views for **Supermarket Store Admins**, **Courier Riders**, and **System Oversight Admins**.

---

## 🔐 Demonstration Login Credentials
Use the following one-click shortcuts on the Login Page, or enter them manually:

| Name | Role | Email | Password |
|---|---|---|---|
| **Nimal Silva** | Customer (Buyer) | `nimal@gmail.com` | `password123` |
| **Keells Manager** | Supermarket Admin | `keells@gmail.com` | `password123` |
| **Pradeep Kumara** | Delivery Courier Rider | `pradeep@gmail.com` | `password123` |
| **Smart Admin** | System Admin | `admin@smartgrocery.lk` | `password123` |

---

## 📁 Directory Structure
```
c:\Users\pesak\Desktop\Smart Grocery/
├── client/                 # React Vite Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Navbar, Skeletons, Comparisons)
│   │   ├── context/        # React Global Context (Auth, Cart, API Urls)
│   │   ├── pages/          # Rendered Dashboard Views (Landing, Dashboards, Tracking)
│   │   ├── App.jsx         # Routes wrapper
│   │   └── main.jsx        # Bootstrapper
│   └── package.json
└── server/                 # Node.js Express Backend & WebSockets
    ├── src/
    │   ├── config/         # DB Connections, Seeding, Mock Fallbacks
    │   ├── controllers/    # Route handler logic, recommendations, predictions
    │   ├── middleware/     # Role-based JWT Auth checks
    │   ├── models/         # Mongoose schemas
    │   ├── routes/         # Express router mounts
    │   └── sockets/        # Socket.io location tracking broadcasters
    ├── data/               # Local Mock fallback database storage (db.json)
    └── package.json
```

---

## ⚙️ Running Locally

### Prerequisites
- Node.js (V18+)
- (Optional) MongoDB. If MongoDB is not running, the server automatically boots in **Mock Fallback Database Mode**, persisting records inside `server/data/db.json` so the app is immediately usable out-of-the-box.

### 1. Start Node Server
```bash
cd server
npm install
npm start
```
*Port: `http://localhost:5000`*

### 2. Start Vite Client
```bash
cd client
npm install
npm run dev
```
*Port: `http://localhost:5173`*
