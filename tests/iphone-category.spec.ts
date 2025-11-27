/**
 * @fileoverview iPhoneカテゴリページのE2Eテスト
 * @module tests/iphone-category.spec
 *
 * EC-271: iPhoneカテゴリページE2Eテスト自動化
 *
 * organization-standards準拠:
 * - Page Object Modelパターン
 * - 明示的待機（sleepではなく要素の出現を待つ）
 * - テストの独立性
 * - 失敗時のスクリーンショット（Playwright設定で自動）
 */

import { test, expect } from '@playwright/test'
import { IPhoneCategoryPage, ProductCategoryPage } from './pages'

test.describe('iPhoneカテゴリページ (EC-271)', () => {
  let iPhonePage: IPhoneCategoryPage

  test.beforeEach(async ({ page }) => {
    iPhonePage = new IPhoneCategoryPage(page)
  })

  test.describe('ページ表示', () => {
    test('iPhoneカテゴリページにアクセスするとページタイトルが表示される', async () => {
      await iPhonePage.goto()
      const title = await iPhonePage.getPageTitle()
      expect(title).toBe('iPhone')
    })

    test('キャンペーンバナーが表示される', async () => {
      await iPhonePage.goto()
      const isVisible = await iPhonePage.isCampaignBannerVisible()
      expect(isVisible).toBe(true)
    })

    test('5件のiPhone製品が表示される', async () => {
      await iPhonePage.goto()
      const count = await iPhonePage.getProductCount()
      expect(count).toBe(5)
    })

    test('製品カードが5件表示される', async () => {
      await iPhonePage.goto()
      // 製品カードが読み込まれるまで待機
      await iPhonePage.waitForProductsToLoad()
      const cardCount = await iPhonePage.getProductCardCount()
      expect(cardCount).toBe(5)
    })

    test('ドコモオンラインショップリンクが表示される', async () => {
      await iPhonePage.goto()
      const hasLink = await iPhonePage.hasDocomoShopLink()
      expect(hasLink).toBe(true)
    })
  })

  test.describe('製品情報表示', () => {
    test('iPhone 16 Pro Maxが表示される', async () => {
      await iPhonePage.goto()
      // 製品カードが読み込まれるまで待機
      await iPhonePage.waitForProductsToLoad()
      const isVisible = await iPhonePage.isProductVisible('iPhone 16 Pro Max')
      expect(isVisible).toBe(true)
    })

    // バックエンドのproduct_variantsテーブルにデータがないためスキップ
    // データ投入後に有効化
    test.skip('ストレージオプションが表示される', async () => {
      await iPhonePage.goto()
      const hasStorage = await iPhonePage.hasStorageOptions()
      expect(hasStorage).toBe(true)
    })

    // バックエンドのproduct_variantsテーブルにデータがないためスキップ
    // データ投入後に有効化
    test.skip('カラーオプションが表示される', async () => {
      await iPhonePage.goto()
      const hasColors = await iPhonePage.hasColorOptions()
      expect(hasColors).toBe(true)
    })

    // バックエンドのproduct_variantsテーブルにデータがないためスキップ
    // データ投入後に有効化
    test.skip('月額料金が表示される', async () => {
      await iPhonePage.goto()
      const hasMonthly = await iPhonePage.hasMonthlyPayment()
      expect(hasMonthly).toBe(true)
    })
  })

  test.describe('ソート機能', () => {
    test('価格順でソートすると最高価格の製品が最初に表示される', async () => {
      await iPhonePage.goto()
      await iPhonePage.selectSortOption('price')
      const firstName = await iPhonePage.getFirstProductName()
      expect(firstName).toBe('iPhone 16 Pro Max')
    })

    test('名前順でソートするとアルファベット順に表示される', async () => {
      await iPhonePage.goto()
      await iPhonePage.selectSortOption('name')
      const firstName = await iPhonePage.getFirstProductName()
      expect(firstName).toBe('iPhone 15')
    })

    // フロントエンドがAPI連携するまでスキップ（EC-272で対応予定）
    // 現在のgetProductPrices()は月額料金も取得してしまうため、API連携後に修正が必要
    test.skip('価格順ソート後、価格が降順になっている', async () => {
      await iPhonePage.goto()
      await iPhonePage.selectSortOption('price')
      const prices = await iPhonePage.getProductPrices()
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1])
      }
    })
  })
})

test.describe('製品ページからiPhoneページへの遷移 (EC-271)', () => {
  test('製品カテゴリページからiPhoneカテゴリページに遷移できる', async ({ page }) => {
    const productPage = new ProductCategoryPage(page)
    const iPhonePage = new IPhoneCategoryPage(page)

    await productPage.goto()
    await productPage.clickIPhoneCategory()

    await page.waitForURL('/products/iphone')
    const title = await iPhonePage.getPageTitle()
    expect(title).toBe('iPhone')
  })
})

test.describe('レスポンシブデザイン (EC-271)', () => {
  test('モバイル表示でも製品カードが正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const iPhonePage = new IPhoneCategoryPage(page)
    await iPhonePage.goto()
    // 製品カードが読み込まれるまで待機
    await iPhonePage.waitForProductsToLoad()

    const cardCount = await iPhonePage.getProductCardCount()
    expect(cardCount).toBe(5)
  })

  test('タブレット表示でも製品カードが正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    const iPhonePage = new IPhoneCategoryPage(page)
    await iPhonePage.goto()
    // 製品カードが読み込まれるまで待機
    await iPhonePage.waitForProductsToLoad()

    const cardCount = await iPhonePage.getProductCardCount()
    expect(cardCount).toBe(5)
  })
})
