import { test, expect, type Page } from '@playwright/test'

const SCREENS = [
  { name: 'dashboard', path: '/' },
  { name: 'subscriptions', path: '/subscriptions' },
  { name: 'import', path: '/import' },
  { name: 'receipt', path: '/receipt' },
  { name: 'achievements', path: '/achievements' },
] as const

async function seedSettledState(page: Page) {
  await page.addInitScript(() => {
    const today = new Date().toISOString().slice(0, 10)
    window.localStorage.setItem('has-completed-onboarding', 'true')
    window.localStorage.setItem(
      'app-settings',
      JSON.stringify({
        theme: 'light',
        hasCompletedOnboarding: true,
        selectedCharacterId: 'main-heroine',
        lastCharacterSelectDate: today,
        lastLoginBonusClaimDate: today,
        characterAffection: {},
        featureVisitDates: {},
      })
    )
  })
}

function disableMotion(page: Page) {
  return page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }
    `,
  })
}

test.describe('主要画面のビジュアルリグレッション', () => {
  test.beforeEach(async ({ page }) => {
    await seedSettledState(page)
  })

  for (const screen of SCREENS) {
    test(`${screen.name} 画面のスクリーンショットがベースラインと一致する`, async ({ page }) => {
      await page.goto(screen.path)
      await disableMotion(page)
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot(`${screen.name}.png`, {
        fullPage: true,
      })
    })
  }
})
