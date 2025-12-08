# 📘 BookMyPlay - Sports Venue Booking Platform

A complete SaaS platform for sports venue owners to manage bookings through WhatsApp integration.

## 🚀 Features

### For Arena Owners
- ✅ Create and manage multiple arenas
- ✅ Add branches with operating hours
- ✅ Configure courts with dynamic pricing
- ✅ Pricing engine (base, day-wise, time-wise)
- ✅ View and manage all bookings
- ✅ Unique shareable booking links
- ✅ Free tier with upgrade options

### For Customers
- ✅ Browse available slots by venue link
- ✅ Select court and time slot
- ✅ Upload payment screenshot
- ✅ Send booking via WhatsApp (no API cost!)
- ✅ No account required - guest booking

### For Admins
- ✅ Approve/reject arena applications
- ✅ Manage all owners and venues
- ✅ Platform-wide analytics
- ✅ View all bookings across system

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB + Mongoose
- **Storage**: Firebase Storage
- **Messaging**: WhatsApp Deep Links (FREE)

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or MongoDB Atlas)
- Firebase project (for image storage)

### Step 1: Clone & Install

```bash
cd d:\BookMyCourt
npm install
```

### Step 2: Environment Variables

Create `.env.local` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/bookmyplay
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookmyplay

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Firebase Storage
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Admin Credentials
ADMIN_EMAIL=admin@bookmyplay.com
ADMIN_PASSWORD=admin123456
```

### Step 3: Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally and start service
mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in .env.local

### Step 4: Setup Firebase Storage

1. Go to https://console.firebase.google.com/
2. Create new project
3. Enable Storage
4. Get configuration from Project Settings
5. Update Firebase variables in .env.local

### Step 5: Generate NextAuth Secret

```bash
# Generate secure secret key
openssl rand -base64 32
```

Copy output to `NEXTAUTH_SECRET` in .env.local

### Step 6: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🎯 Usage Guide

### For Arena Owners

1. **Sign Up**
   - Visit http://localhost:3000
   - Click "Sign Up" under Arena Owner
   - Fill registration form
   - Login with credentials

2. **Create Arena**
   - Go to Dashboard → Arenas
   - Click "Create Arena"
   - Fill arena details
   - Wait for admin approval

3. **Add Branches**
   - Select your arena
   - Click "Add Branch"
   - Set operating hours and location

4. **Add Courts**
   - Select a branch
   - Click "Add Court"
   - Configure pricing rules:
     - Base Price (default)
     - Day-wise pricing (optional)
     - Time-slab pricing (optional)

5. **Share Booking Link**
   - Get your unique URL: `/book/your-arena-slug`
   - Share on social media, WhatsApp status
   - Add to Google My Business, Instagram bio

6. **Manage Bookings**
   - View all bookings in dashboard
   - See customer details and payment screenshots
   - Confirm or cancel bookings
   - Reply to customers on WhatsApp

### For Customers

1. Customer gets booking link from venue's social media
2. Clicks link → lands on booking page
3. Selects court and available slot
4. Fills name, phone, uploads payment screenshot
5. Clicks "Send to Owner via WhatsApp"
6. WhatsApp opens with pre-filled message
7. Customer sends message
8. Owner confirms on WhatsApp

### For Admins

1. Login at `/admin/login`
2. Approve pending arenas
3. View platform analytics
4. Manage all owners and venues

## 📂 Project Structure

```
bookmyplay/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth pages
│   │   ├── owner/               # Owner portal
│   │   │   ├── dashboard/       # Dashboard
│   │   │   ├── arenas/          # Arena management
│   │   │   ├── bookings/        # Booking management
│   │   │   ├── login/           # Login page
│   │   │   └── signup/          # Signup page
│   │   ├── admin/               # Admin portal
│   │   ├── book/[slug]/         # Public booking pages
│   │   └── api/                 # API routes
│   │       ├── auth/            # NextAuth
│   │       ├── arenas/          # Arena APIs
│   │       ├── branches/        # Branch APIs
│   │       ├── courts/          # Court APIs
│   │       └── bookings/        # Booking APIs
│   ├── components/              # React components
│   ├── lib/                     # Utilities
│   │   ├── mongodb.ts           # DB connection
│   │   ├── auth.ts              # Auth config
│   │   ├── firebase.ts          # Firebase config
│   │   └── utils.ts             # Helper functions
│   ├── models/                  # Mongoose models
│   │   ├── Owner.ts
│   │   ├── Arena.ts
│   │   ├── Branch.ts
│   │   ├── Court.ts
│   │   └── Booking.ts
│   └── types/                   # TypeScript types
├── public/                      # Static files
├── .env.local                   # Environment variables
├── package.json
└── README.md
```

## 🔑 Default Accounts

### Admin Account
- Email: admin@bookmyplay.com
- Password: admin123456
- (Create manually in database first time)

## 🌐 Deployment

### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configure environment variables in Vercel dashboard.

### Environment Setup
1. MongoDB Atlas connection string
2. Firebase configuration
3. NextAuth secret
4. Set NEXTAUTH_URL to production URL

## 📊 Database Models

### Owner
- Account management
- Free/Premium tier
- Multiple arenas

### Arena
- Venue information
- Unique slug for booking URL
- Approval status

### Branch
- Location details
- Operating hours
- Multiple per arena

### Court
- Pricing engine
- Time slot configuration
- Branch association

### Booking
- Customer details
- Payment info
- Status tracking
- WhatsApp integration

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Protected API routes
- ✅ Role-based access control
- ✅ Input validation
- ✅ MongoDB injection prevention

## 🚧 Future Enhancements

- [ ] Premium features (analytics, reports)
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Payment gateway integration
- [ ] Loyalty programs
- [ ] QR code generation
- [ ] Calendar integrations

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: support@bookmyplay.com

## 📄 License

Private - All rights reserved

## 👨‍💻 Developer

Built by RAIZIOS Team
Version 1.0.0
December 2025

---

**Happy Booking! 🎉**
