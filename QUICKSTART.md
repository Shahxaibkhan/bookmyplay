# 🚀 Quick Start Guide - BookMyPlay

## First Time Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update:

```env
# MongoDB (Required)
MONGODB_URI=mongodb://localhost:27017/bookmyplay

# NextAuth (Required)
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Firebase (Optional for now - for image uploads)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Admin Credentials
ADMIN_EMAIL=admin@bookmyplay.com
ADMIN_PASSWORD=admin123456
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas**
- Create free account at mongodb.com/cloud/atlas
- Get connection string
- Update MONGODB_URI in .env.local

### 4. Create Admin Account
```bash
node src/scripts/setup.js
```

This will create the initial admin account.

### 5. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## 🎯 Test the Application

### Test as Owner
1. Go to http://localhost:3000
2. Click "Sign Up" under Arena Owner
3. Register a new owner account
4. Login and create an arena
5. Go to admin dashboard and approve it
6. Add branches and courts
7. Get your booking URL

### Test as Admin
1. Go to http://localhost:3000/admin/login
2. Login with:
   - Email: admin@bookmyplay.com
   - Password: admin123456
3. Approve pending arenas
4. View all bookings and analytics

### Test as Customer
1. Get a booking URL from an approved arena
2. Example: http://localhost:3000/book/your-arena-slug
3. Select court, date, and time slot
4. Fill booking details
5. Click "Send via WhatsApp"

## 📱 WhatsApp Integration

The system uses **WhatsApp Deep Links** (completely free):
- No WhatsApp Business API required
- No monthly fees
- Works on any device
- Opens native WhatsApp app

## 🔥 Firebase Setup (Optional)

For image uploads (court photos, payment screenshots):

1. Go to https://console.firebase.google.com/
2. Create new project
3. Enable Storage
4. Go to Project Settings → General
5. Copy configuration
6. Update Firebase variables in .env.local

## 📊 Features Implemented

✅ Owner Portal
- Signup/Login
- Dashboard with stats
- Arena management
- Branch management  
- Court management with pricing engine
- Booking management

✅ Customer Booking Flow
- Public booking pages
- Slot selection
- Guest booking (no login)
- WhatsApp integration

✅ Admin Portal
- Login
- Approve arenas
- View all bookings
- Platform analytics

✅ API Routes
- All CRUD operations
- Authentication
- Authorization

## 🐛 Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in .env.local
- For Atlas, whitelist your IP address

### NextAuth Error
- Generate new secret: `openssl rand -base64 32`
- Update NEXTAUTH_SECRET in .env.local

### Port Already in Use
- Kill process on port 3000
- Or change port: `npm run dev -- -p 3001`

## 📞 Need Help?

Check the full README.md for detailed documentation.

---

**Happy Building! 🎉**
