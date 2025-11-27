/**
 * @fileoverview 製品カテゴリページのPage Object
 * @module tests/pages/ProductCategoryPage
 *
 * EC-271: iPhoneカテゴリページE2Eテスト自動化
 *
 * organization-standards準拠:
 * - Page Object Modelパターン
 * - 明示的待機（sleepではなく要素の出現を待つ）
 */

import { type Page, type Locator } from '@playwright/test'

/**
 * 製品カテゴリページのPage Object
 */
export class ProductCategoryPage {
  readonly page: Page
  readonly iPhoneCategoryCard: Locator
  readonly categoryCards: Locator

  constructor(page: Page) {
    this.page = page
    this.iPhoneCategoryCard = page.locator('a[href="/products/iphone"]')
    this.categoryCards = page.locator('[data-testid="category-card"]')
  }

  /**
   * ページに移動
   */
  async goto(): Promise<void> {
    await this.page.goto('/products')
  }

  /**
   * iPhoneカテゴリカードをクリック
   */
  async clickIPhoneCategory(): Promise<void> {
    await this.iPhoneCategoryCard.click()
  }

  /**
   * iPhoneカテゴリカードが表示されているか
   */
  async isIPhoneCategoryVisible(): Promise<boolean> {
    return this.page.locator('text=iPhone').first().isVisible()
  }

  /**
   * カテゴリカードの数を取得
   */
  async getCategoryCardCount(): Promise<number> {
    return this.categoryCards.count()
  }
}
