import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import Owner from '@/models/Owner';
import Arena from '@/models/Arena';
import Branch from '@/models/Branch';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

async function ensureDbConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI must be set to run owner/admin Playwright flows.');
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { bufferCommands: false });
  }
}

test.describe('Owner and Admin UI flows', () => {
  test('owner can sign up via API and reach dashboard after login', async ({ page, request }) => {
    const unique = Date.now();
    const ownerEmail = `pw-owner-${unique}@bookmyplay.test`;
    const ownerPassword = 'PwOwner!123';

    const signupResponse = await request.post('/api/owner/signup', {
      data: {
        name: 'Playwright Owner',
        email: ownerEmail,
        password: ownerPassword,
        phone: '+923001234567',
      },
    });

    expect(signupResponse.ok()).toBeTruthy();

    await page.goto('/owner/login');
    await page.getByLabel('Email').fill(ownerEmail);
    await page.getByLabel('Password').fill(ownerPassword);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/owner\/dashboard/);
    await expect(page.getByText('Track arenas, branches, courts, and bookings')).toBeVisible();

    await ensureDbConnection();
    await Owner.deleteOne({ email: ownerEmail });
  });

  test('admin can approve a pending branch from dashboard', async ({ page }) => {
    test.skip(!adminEmail || !adminPassword, 'Set ADMIN_EMAIL and ADMIN_PASSWORD to exercise admin UI flow.');

    const unique = Date.now();
    await ensureDbConnection();

    const tempOwner = await Owner.create({
      name: 'Admin Flow Owner',
      email: `pw-admin-owner-${unique}@bookmyplay.test`,
      password: 'hashed',
      phone: '+923004445556',
      role: 'owner',
      accountType: 'free',
      isActive: true,
    });

    const tempArena = await Arena.create({
      ownerId: tempOwner._id,
      name: `Playwright Admin Arena ${unique}`,
      slug: `pw-admin-arena-${unique}`,
      description: 'Seeded for Playwright admin test',
      isActive: true,
    });

    const tempBranch = await Branch.create({
      arenaId: tempArena._id,
      name: `Pending Branch ${unique}`,
      address: '66 Prime Way',
      city: 'Karachi',
      area: 'North',
      whatsappNumber: '+923006667778',
      googleMapLink: 'https://maps.example.com/pending-branch',
      isApproved: false,
      isActive: true,
    });

    try {
      await page.goto('/admin/login');
      await page.getByLabel('Email').fill(adminEmail!);
      await page.getByLabel('Password').fill(adminPassword!);
      await page.getByRole('button', { name: 'Login as Admin' }).click();

      await expect(page).toHaveURL(/admin\/dashboard/);
      await expect(page.getByRole('heading', { name: 'Pending Branch Approvals' })).toBeVisible();

      const branchCard = page.locator('div', { hasText: tempBranch.name }).first();
      await expect(branchCard).toBeVisible();
      await branchCard.getByRole('button', { name: 'Approve' }).click();

      await expect(page.getByText('Branch approved successfully', { exact: false })).toBeVisible();
    } finally {
      await ensureDbConnection();
      await Branch.deleteOne({ _id: tempBranch._id });
      await Arena.deleteOne({ _id: tempArena._id });
      await Owner.deleteOne({ _id: tempOwner._id });
    }
  });
});
