import { APP_NAV_ITEMS } from '@/lib/navigation'

describe('navigation', () => {
  it('defines nav items for every main route in display order', () => {
    expect(APP_NAV_ITEMS.map((item) => item.href)).toEqual([
      '/',
      '/subscriptions',
      '/import',
      '/history',
      '/receipt',
      '/trends',
      '/suggestions',
      '/achievements',
    ])
  })

  it('provides label, shortLabel, feature and icon for every item', () => {
    APP_NAV_ITEMS.forEach((item) => {
      expect(item.label.length).toBeGreaterThan(0)
      expect(item.shortLabel.length).toBeGreaterThan(0)
      expect(item.feature.length).toBeGreaterThan(0)
      expect(item.icon.length).toBeGreaterThan(0)
    })
  })

  it('uses a unique icon key per nav item', () => {
    const icons = APP_NAV_ITEMS.map((item) => item.icon)
    expect(new Set(icons).size).toBe(icons.length)
  })
})
