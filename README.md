# Kirana - Modern Local Grocery Ecosystem 🛒✨

A high-performance, premium grocery application built for local communities. Features a seamless experience for both customers and shopkeepers with a focus on minimalist design and utility.

## ✨ Premium Features
- **Deluxe 2-Column Grid**: Vibrant, image-centric category navigation with smart font-scaling. 🍱🍱
- **Shopkeeper Portfolio**: Professional portal for local vendors to manage inventory and real-time orders. 🛍️📱
- **Digital Credits (Udhaar)**: Integrated ledger system to manage trusted local transactions. 📊✅
- **Race-Condition-Free Auth**: Crystal-clear navigation with synchronized loading states. 🛡️⚡
- **Multi-Server Ready**: Configured for local development or production hosting on Render. 🌐🔌

## 🛠️ Technology Stack
- **Frontend**: React Native (Expo) - Premium Minimalist Layout
- **Backend**: Node.js + Express (Production-Ready)
- **Database**: MongoDB Atlas (Cloud)
- **Real-time**: Socket.io for instant order notifications
- **AI Integration**: Gemini-powered smart product discovery

## 🚀 Deployment Guide

### 1. Backend (Render Hosting) 🌐
- Create a New Web Service and connect this repository.
- **Pre-requisites**: Ensure these Environment Variables are set:
  - `MONGO_URI`: Your MongoDB Atlas connection string.
  - `GEMINI_API_KEY`: Your Google AI API key.
  - `PORT`: (Managed by Render).
- **Start Scripts**: `npm install` (Build) and `npm start` (Start).

### 2. Frontend (APK Build) 📱
- **Configure**: Open `config.js` and paste your Render URL into the `BASE_URL` placeholder.
- **Build**: Run the following command for a downloadable APK:
  ```bash
  eas build -p android --profile preview
  ```

## 🧹 Maintenance
- **Full Reset**: Run `node server/reset_database.js` to clear all collections for a fresh start.
- **Clean Codebase**: All legacy test scripts and unused utilities have been removed.

---
Built with ❤️ for a premium local shopping experience.
