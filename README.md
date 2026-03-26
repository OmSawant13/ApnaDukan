# Kirana - Full-Stack Local Grocery Ecosystem 🛒✨

An enterprise-grade, premium grocery platform designed to bridge the gap between local shopkeepers and their communities. Built with a focus on **Minimalist UX**, **Real-time Synchronization**, and **Digital Ledger Management**.

---

## 🏗️ Technical Architecture

This ecosystem is divided into two main components that communicate via a RESTful API and Real-time WebSockets:

### 1. **Frontend (The Mobile Hub)** 📱
- **Engine**: React Native (Expo SDK)
- **Design System**: Deluxe Minimalist (Haldi-Green & Pure White Palette).
- **Navigation**: React Navigation (Tab + Native Stack) with advanced **Race-Condition-Free** loading guards.
- **State Management**: Context API (Auth, Product, Shop, Order, Credit, Socket, Language).

### 2. **Backend (The Core Engine)** ⚙️
- **Engine**: Node.js + Express.js
- **Database**: MongoDB Atlas (Cloud Storage).
- **Real-time**: Socket.io for instant order and credit updates.
- **AI**: Google Gemini Integration for smart product discovery.
- **Security**: Password hashing and environment-based configuration.

---

## ✨ Key Modules & Feature Sets

### 🍱 Category Discovery (The "Deluxe" Grid)
- **UI Logic**: A 2-column minimalist grid that calculates `CARD_WIDTH` dynamically.
- **Visuals**: Large, high-resolution category icons in rounded-square tiles (`24px` radius).
- **Typography**: Smart `adjustsFontSizeToFit` labels to prevent word-breaks (e.g., "Vegetables").

### 🛍️ Shopkeeper Portal
- **Dashboard**: Real-time overview of active orders and inventory.
- **Inventory Management**: Add, Edit, Delete products with support for weighted items.
- **QR / Branding**: Manage shop registration and public shop profile.

### 🔳 Digital Credit Ledger (Udhaar)
- **Trust-Based Transactions**: A fully integrated credit tracking system for regular customers.
- **Sync**: Direct link between order completion and credit account updates.

### 🛡️ Atomic Authentication
- **Flash-Free Loading**: Highly optimized `AuthContext` and `ShopContext` synchronization.
- **Auto-Logout**: Automatic session cleanup if the backend database is reset or the user is deleted.

---

## 🚀 Step-by-Step Deployment Guide

### 🅰️ Backend (Render Setup)
1. **Repository**: Connect your GitHub repo to a New Web Service.
2. **Environment Variables**:
   - `MONGO_URI`: `mongodb+srv://...`
   - `GEMINI_API_KEY`: `AIza...`
   - `PORT`: (Render sets this automatically).
3. **Internal Config**: Ensure `server/index.js` listens on `process.env.PORT`.

### 🅱️ Frontend (Physical Android APK)
1. **EAS Setup**: Run `eas login` on your local machine.
2. **Config Sync**:
   - Open `config.js`.
   - Paste your **Render URL** into the `https://...` placeholder.
   - Comment out the `localhost` or local IP line.
3. **Build**:
   ```bash
   eas build -p android --profile preview
   ```
4. **Install**: Copy the generated link to your phone and install the APK.

---

## 🧬 Folder Structure Overview

```bash
├── components/          # Reusable UI Atoms & Molecules
├── context/             # Global State (Auth, Shop, Product, etc.)
├── navigation/          # React Navigation stacks & guards
├── screens/             # Main Feature Views
│   ├── shopkeeper/      # Vendor-specific portal
│   └── customer/        # Shopping experience
├── server/              # Node.js Backend
│   ├── models/          # MongoDB Schemas
│   ├── routes/          # API Handlers
│   ├── services/        # AI & External logic
│   └── reset_database.js # Emergency Cleanup Utility
└── config.js            # Unified Network Configuration
```

---

## 🧹 Maintenance & Utilities

### 🚿 Complete Database Purge
If you need to restart the project as a "Complete New App", run the following:
```bash
cd server
node reset_database.js
```
*Wait for the "DATABASE RESET COMPLETE" confirmation.*

---

## 🔌 Troubleshooting

- **Network Error**: Usually occurs if the IP in `config.js` does not match your computer's IP (for dev) or the Render URL (for production).
- **Broken Images**: Ensure the `server/uploads` folder is correctly pointed or use an external CDN like Cloudinary.

---
Built with ❤️ by **Antigravity** | Premium Kirana Ecosystem.
