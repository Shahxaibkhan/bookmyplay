# Manual QA Checklist

Use this checklist whenever you need to validate the core owner → booking funnel. The flow mirrors what a new venue partner would do: sign up, configure inventory, and record an initial booking.

## Pre-flight Setup

1. Ensure `MONGODB_URI`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are configured in your shell or `.env.local`.
2. Seed baseline demo data (owners/arenas/branches/courts/bookings) so empty states are avoided:
   ```bash
   npx ts-node scripts/seed-demo-data.ts
   ```
   > The script is idempotent; rerun it anytime you want the reference data back.
3. Start the Next.js dev server in a separate terminal (`npm run dev`).
4. Open two browser profiles (or an incognito window) so you can interact as both an owner and a public customer if needed.

## Core Flow Checklist

| # | Step | Action | Expected Outcome |
|---|------|--------|------------------|
| 1 | **Owner signup** | Visit `/owner/signup`, complete the form with a fresh email/phone, and submit. | You land on `/owner/login?registered=true` and see the success toast. |
| 2 | **Owner login** | Log in with the newly created credentials. | You are redirected into `/owner/dashboard` without middleware loops. |
| 3 | **Create arena** | From the dashboard, click "Create Arena" (or equivalent CTA) and fill out required fields. | Arena card appears in the list and `/api/arenas` shows the new record tied to your owner ID. |
| 4 | **Add branch** | Within the arena, create a branch with WhatsApp + payout details. | Branch detail view renders payment info and branch status is active/approved. |
| 5 | **Add court** | Inside the branch, add at least one court with pricing, slot duration, and schedule. | Court card appears; `/api/courts?branchId=...` returns the entity. |
| 6 | **Create booking** | Use the public booking page (`/book/[slug]`) or owner bookings UI to block a slot. | Booking appears under `/owner/bookings` with correct status + WhatsApp handoff, and the slot becomes unavailable on the public form. |

## Run Log
Document every execution so issues are caught early. Each run should cover all six steps above.

### Pass #1
- Date / Tester: ______________________
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
- [ ] Step 4
- [ ] Step 5
- [ ] Step 6
- Notes:
  - _______________________________________________________
  - _______________________________________________________

### Pass #2
- Date / Tester: ______________________
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
- [ ] Step 4
- [ ] Step 5
- [ ] Step 6
- Notes:
  - _______________________________________________________
  - _______________________________________________________

### Additional Findings
Use this section for any bugs, screenshots, or follow-up tasks discovered during either pass.

- ____________________________________________________________
- ____________________________________________________________
