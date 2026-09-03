# BookMyPlay Demo Guide

## What BookMyPlay Does

BookMyPlay is a sports venue operating platform. Arena owners manage venues, branches, courts, schedules, prices, and bookings from one dashboard. Customers use a public arena link to select a branch, court, date, and time slot without creating an account.

The platform is designed around a simple promise: an owner can publish available inventory once, while customers book the right court and time directly.

## Demo Setup

Run the demo seed against the target database:

```bash
npm install
npm run demo:seed
npm run dev
```

Required environment variables:

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=use-a-long-random-secret
NEXTAUTH_URL=https://www.bookmyplay.pk
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-strong-admin-password
```

The seed is intended for a demo database. It creates or reuses the demo owner and realistic venues, branches, courts, and sample bookings. It is idempotent for matching arena, branch, court, and slot names.

## Demo Accounts

The seeded owner account is:

```text
Email: demo-owner@bookmyplay.test
Password: PlayHard123!
```

Use a real admin account configured through `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Do not use the default development password in a public deployment.

The seeded phone numbers, bank details, payment references, and customer records are fictional demo data. Replace them before showing a real venue or accepting real payments.

## Demo Inventory

The seed includes three venue stories:

### Emerald Sports Hub

A Karachi multi-location venue with padel and futsal inventory. It demonstrates different branches and evening time-slab pricing.

### Capital Racket Club

An Islamabad racket and indoor-football center. It demonstrates tennis, futsal, and weekend day pricing.

### Lahore Play District

A Lahore family sports destination with:

- Gulberg III branch: two padel courts, an indoor cricket bay, and badminton.
- DHA Phase 5 branch: futsal, cricket practice, and tennis.

### Rally & Turf Lahore

A Model Town venue with padel, football turf, and squash using different slot durations.

## Owner Walkthrough

1. Open `/owner/login` and sign in as the demo owner.
2. Open `/owner/dashboard` to show arena, booking, and activity summaries.
3. Open `/owner/arenas` to compare venues and approval status.
4. Open an arena and select a branch.
5. Show court names, sport types, prices, slot duration, and opening hours.
6. Open `/owner/bookings` to see all bookings across the owner's arenas.
7. Search by booking reference, customer, phone, branch, or court.
8. Select **Manage booking** to open the protected booking detail page.
9. Reschedule a booking by choosing a valid future date/time and entering a reason.
10. Cancel a booking by entering a reason.
11. Use **Message customer on WhatsApp** to open a prepared update. WhatsApp deep links prepare the message; the owner still presses Send.

## Admin Walkthrough

1. Open `/admin/login`.
2. Sign in with the configured admin account.
3. Review platform-wide arenas, branches, bookings, and revenue.
4. Approve or reject pending arena and branch submissions.
5. Confirm the owner dashboard and public booking page reflect approval changes.

## Customer Walkthrough

1. Open an arena booking URL such as `/book/lahore-play-district` after seeding.
2. Select a branch.
3. Select a court.
4. Pick a future date.
5. Choose an available slot.
6. Enter name, phone, and optional payment reference.
7. Submit the booking.
8. The server confirms a valid booking immediately and blocks the slot.
9. The customer is shown a prepared WhatsApp handoff to the branch.

A public booking never trusts price, duration, end time, or status from the browser. The server derives those values from the selected court and validates the arena, branch, schedule, and player limit.

## Booking Operations

Public bookings are confirmed immediately to minimize owner work. The owner does not need to approve every normal booking.

The owner only intervenes when a booking must be cancelled or moved:

- Cancellation requires a reason.
- Rescheduling requires a new date, time, and reason.
- Existing bookings are not silently deleted or moved.
- Occupied replacement slots are rejected.
- The action is recorded in booking history.
- The owner can prepare a WhatsApp message for the customer.

The dashboard is the source of truth. WhatsApp is a communication handoff, not an automated delivery guarantee.

## End-to-End Verification

Run the automated checks locally:

```bash
npm test
npm run build
npm run test:e2e
```

The integration tests cover:

- Owner onboarding and authorization.
- Admin branch approval.
- Public arena visibility.
- Price and end-time tampering.
- Past dates, closed courts, invalid duration, and player limits.
- Duplicate and concurrent slot booking.
- Owner-only booking access.
- Cancellation and rescheduling validation.

For the public Playwright smoke test, provide an approved slug:

```bash
PLAYWRIGHT_PUBLIC_ARENA_SLUG=lahore-play-district npm run test:e2e -- playwright/smoke.spec.ts
```

## Before a Real Customer Launch

- Replace demo contact and payout details.
- Use a production MongoDB user with least-privilege access.
- Restrict MongoDB network access to the deployment environment.
- Set a strong `NEXTAUTH_SECRET` and production URL.
- Change all default admin credentials.
- Back up the database and test restoration.
- Decide how payment verification, refunds, and customer cancellation policy work.
- Monitor database errors, failed booking requests, and deployment logs.
- Never seed fictional records into the production database.
