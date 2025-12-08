import { test, expect } from '@playwright/test';

const PUBLIC_SLUG = process.env.PLAYWRIGHT_PUBLIC_ARENA_SLUG;

const ONE_DAY = 24 * 60 * 60 * 1000;

test.skip(!PUBLIC_SLUG, 'Set PLAYWRIGHT_PUBLIC_ARENA_SLUG to run this smoke test.');

test.describe('Public booking smoke', () => {
  test('visitor can reach WhatsApp-ready state', async ({ page, request }) => {
    const slug = PUBLIC_SLUG!;

    const arenaResponse = await request.get(`/api/public/arena/${slug}`);
    expect(arenaResponse.ok()).toBeTruthy();
    const payload = (await arenaResponse.json()) as {
      arena: { name: string };
      branches: Array<{ _id: string; name: string }>;
      courts: Array<{ _id: string; branchId: string }>;
    };

    const primaryBranch = payload.branches[0];
    expect(primaryBranch, 'Arena must expose at least one approved branch').toBeTruthy();

    const primaryCourt = payload.courts.find(
      (court) => court.branchId === primaryBranch._id
    );
    expect(primaryCourt, 'Branch must expose at least one court').toBeTruthy();

    const bookingDate = new Date(Date.now() + 7 * ONE_DAY)
      .toISOString()
      .slice(0, 10);

    await page.goto(`/book/${slug}`);
    await expect(page.getByRole('heading', { name: payload.arena.name })).toBeVisible();

    const branchSelect = page.locator('select').first();
    await branchSelect.selectOption(primaryBranch!._id);

    const courtSelect = page.locator('select').nth(1);
    await expect(courtSelect).toBeVisible();
    await courtSelect.selectOption(primaryCourt!._id);

    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill(bookingDate);
    await dateInput.blur();

    await expect(
      page.getByRole('heading', { name: /Select Time Slot/i })
    ).toBeVisible({ timeout: 15000 });

    const slotButton = page.locator('button', { hasText: 'Rs' }).first();
    await expect(slotButton).toBeVisible();
    await slotButton.click();

    await page.getByLabel('Full Name *').fill('Playwright Smoke Test');
    const phoneInput = page.getByLabel('Phone Number *');
    await phoneInput.fill('03123456789');
    await phoneInput.blur();
    await page
      .getByLabel('Payment Reference / Transaction ID')
      .fill(`PW-${Date.now()}`);

    const ctaButton = page.getByRole('button', {
      name: /Send Booking via WhatsApp/i,
    });
    await expect(ctaButton).toBeEnabled();
  });
});
