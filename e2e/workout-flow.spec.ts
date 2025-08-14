
import { test, expect } from '@playwright/test';

test.describe('Workout Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should complete onboarding flow', async ({ page }) => {
    // Check if we're on welcome screen
    await expect(page.getByText('Welcome to PlankIt')).toBeVisible();
    
    // Click get started
    await page.getByText('Get Started').click();
    
    // Should navigate through onboarding
    await expect(page.getByText('Welcome!')).toBeVisible();
  });

  test('should navigate between dashboard tabs', async ({ page }) => {
    // Skip welcome screen if it appears
    const getStartedButton = page.getByText('Get Started');
    if (await getStartedButton.isVisible()) {
      await getStartedButton.click();
    }
    
    // Check if we can see dashboard tabs
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Workout')).toBeVisible();
    await expect(page.getByText('Stats')).toBeVisible();
    await expect(page.getByText('Achievements')).toBeVisible();
    await expect(page.getByText('Profile')).toBeVisible();
    
    // Navigate to workout tab
    await page.getByText('Workout').click();
    
    // Navigate to achievements tab
    await page.getByText('Achievements').click();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still accessible
    await expect(page.getByText('Welcome to PlankIt')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check that content adapts
    await expect(page.getByText('Welcome to PlankIt')).toBeVisible();
  });
});
