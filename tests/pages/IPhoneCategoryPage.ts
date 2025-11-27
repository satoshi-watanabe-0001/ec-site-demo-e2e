/**
 * @fileoverview iPhoneカテゴリページのPage Object
 * @module tests/pages/IPhoneCategoryPage
 *
 * EC-271: iPhoneカテゴリページE2Eテスト自動化
 *
 * organization-standards準拠:
 * - Page Object Modelパターン
 * - 明示的待機（sleepではなく要素の出現を待つ）
 * - UIの変更に強い構造
 */

import { type Page, type Locator } from '@playwright/test'

/**
 * iPhoneカテゴリページのPage Object
 * UIの変更に強い構造を提供
 */
export class IPhoneCategoryPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly campaignBanner: Locator
  readonly productCount: Locator
  readonly productCards: Locator
  readonly sortSelect: Locator
  readonly docomoShopLinks: Locator
  readonly storageOptions: Locator
  readonly colorOptions: Locator
  readonly monthlyPayment: Locator
  readonly loadingIndicator: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1')
    this.campaignBanner = page.locator('text=iPhone特別キャンペーン実施中！')
    this.productCount = page.locator('text=/\\d+件の製品が見つかりました/')
    this.productCards = page.locator('article')
    this.sortSelect = page.locator('#sort')
    this.docomoShopLinks = page.locator('a:has-text("ドコモオンラインショップで購入")')
    this.storageOptions = page.locator('text=容量:')
    this.colorOptions = page.locator('text=カラー:')
    this.monthlyPayment = page.locator('text=/月々.*円〜/')
    this.loadingIndicator = page.locator('[data-testid="loading"]')
    this.errorMessage = page.locator('[data-testid="error-message"]')
  }

  /**
   * ページに移動
   */
  async goto(): Promise<void> {
    await this.page.goto('/products/iphone')
  }

  /**
   * ページタイトルを取得
   */
  async getPageTitle(): Promise<string | null> {
    return this.pageTitle.textContent()
  }

  /**
   * キャンペーンバナーのタイトルを取得
   */
  async getCampaignBannerTitle(): Promise<string | null> {
    return this.page.locator('h2:has-text("iPhone特別キャンペーン")').textContent()
  }

  /**
   * キャンペーンバナーが表示されているか
   */
  async isCampaignBannerVisible(): Promise<boolean> {
    return this.campaignBanner.isVisible()
  }

  /**
   * 製品数を取得
   */
  async getProductCount(): Promise<number> {
    const text = await this.productCount.textContent()
    const match = text?.match(/(\d+)件/)
    return match ? parseInt(match[1], 10) : 0
  }

  /**
   * 製品カードの数を取得
   */
  async getProductCardCount(): Promise<number> {
    return this.productCards.count()
  }

  /**
   * ソートオプションを選択
   */
  async selectSortOption(value: 'name' | 'price'): Promise<void> {
    await this.sortSelect.selectOption(value)
  }

  /**
   * 最初の製品名を取得
   */
  async getFirstProductName(): Promise<string | null> {
    return this.page.locator('article h3').first().textContent()
  }

  /**
   * すべての製品名を取得
   */
  async getAllProductNames(): Promise<string[]> {
    const names = await this.page.locator('article h3').allTextContents()
    return names
  }

  /**
   * ドコモオンラインショップリンクが存在するか
   */
  async hasDocomoShopLink(): Promise<boolean> {
    return this.docomoShopLinks.first().isVisible()
  }

  /**
   * ドコモオンラインショップリンクの数を取得
   */
  async getDocomoShopLinkCount(): Promise<number> {
    return this.docomoShopLinks.count()
  }

  /**
   * 特定の製品名が表示されているか
   */
  async isProductVisible(productName: string): Promise<boolean> {
    return this.page.locator(`text=${productName}`).isVisible()
  }

  /**
   * ストレージオプションが表示されているか
   */
  async hasStorageOptions(): Promise<boolean> {
    return this.storageOptions.first().isVisible()
  }

  /**
   * カラーオプションが表示されているか
   */
  async hasColorOptions(): Promise<boolean> {
    return this.colorOptions.first().isVisible()
  }

  /**
   * 月額料金が表示されているか
   */
  async hasMonthlyPayment(): Promise<boolean> {
    return this.monthlyPayment.first().isVisible()
  }

  /**
   * ローディング状態が完了するまで待機
   */
  async waitForLoadingComplete(): Promise<void> {
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      // ローディングインジケーターが存在しない場合は無視
    })
  }

  /**
   * 製品カードが表示されるまで待機
   */
  async waitForProductsToLoad(): Promise<void> {
    await this.productCards.first().waitFor({ state: 'visible', timeout: 10000 })
  }

  /**
   * エラーメッセージが表示されているか
   */
  async hasErrorMessage(): Promise<boolean> {
    return this.errorMessage.isVisible()
  }

  /**
   * エラーメッセージのテキストを取得
   */
  async getErrorMessageText(): Promise<string | null> {
    if (await this.hasErrorMessage()) {
      return this.errorMessage.textContent()
    }
    return null
  }

  /**
   * 製品カードの価格を取得
   */
  async getProductPrices(): Promise<number[]> {
    const priceTexts = await this.page.locator('article').locator('text=/\\d+,?\\d*円〜/').allTextContents()
    return priceTexts.map(text => {
      const match = text.match(/([0-9,]+)円/)
      return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0
    })
  }

  /**
   * ページのスクリーンショットを取得
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true })
  }
}
