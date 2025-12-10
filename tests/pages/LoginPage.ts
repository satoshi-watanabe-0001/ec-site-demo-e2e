/**
 * @fileoverview ログインページのPage Object
 * @module tests/pages/LoginPage
 *
 * EC-275: ログイン画面E2E
 *
 * organization-standards準拠:
 * - Page Object Modelパターン
 * - 明示的待機（sleepではなく要素の出現を待つ）
 * - UIの変更に強い構造
 */

import { type Page, type Locator } from '@playwright/test'

/**
 * ログインページのPage Object
 * UIの変更に強い構造を提供
 */
export class LoginPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly rememberMeCheckbox: Locator
  readonly submitButton: Locator
  readonly passwordToggleButton: Locator
  readonly errorAlert: Locator
  readonly emailError: Locator
  readonly passwordError: Locator
  readonly forgotPasswordLink: Locator
  readonly signupLink: Locator
  readonly recentAccountsList: Locator

  constructor(page: Page) {
    this.page = page
    this.pageTitle = page.locator('h1')
    this.emailInput = page.locator('#email')
    this.passwordInput = page.locator('#password')
    this.rememberMeCheckbox = page.locator('#rememberMe')
    this.submitButton = page.locator('button[type="submit"]')
    this.passwordToggleButton = page.locator('button[aria-label*="パスワード"]')
    this.errorAlert = page.locator('[role="alert"]')
    this.emailError = page.locator('#email + [role="alert"], #email ~ [role="alert"]')
    this.passwordError = page.locator('#password').locator('..').locator('[role="alert"]')
    this.forgotPasswordLink = page.locator('a[href="/forgot-password"]')
    this.signupLink = page.locator('a[href="/signup"]')
    this.recentAccountsList = page.locator('text=過去にログインしたアカウント')
  }

  /**
   * ページに移動
   */
  async goto(): Promise<void> {
    await this.page.goto('/login')
  }

  /**
   * ページタイトルを取得
   */
  async getPageTitle(): Promise<string | null> {
    return this.pageTitle.textContent()
  }

  /**
   * メールアドレスを入力
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email)
  }

  /**
   * パスワードを入力
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password)
  }

  /**
   * ログイン状態を保持するチェックボックスをチェック
   */
  async checkRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.check()
  }

  /**
   * ログインボタンをクリック
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click()
  }

  /**
   * ログイン処理を実行
   */
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.fillEmail(email)
    await this.fillPassword(password)
    if (rememberMe) {
      await this.checkRememberMe()
    }
    await this.clickSubmit()
  }

  /**
   * パスワード表示/非表示を切り替え
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggleButton.click()
  }

  /**
   * パスワードフィールドのタイプを取得
   */
  async getPasswordFieldType(): Promise<string | null> {
    return this.passwordInput.getAttribute('type')
  }

  /**
   * エラーアラートが表示されているか
   */
  async isErrorAlertVisible(): Promise<boolean> {
    return this.errorAlert.first().isVisible()
  }

  /**
   * エラーアラートのテキストを取得
   */
  async getErrorAlertText(): Promise<string | null> {
    if (await this.isErrorAlertVisible()) {
      return this.errorAlert.first().textContent()
    }
    return null
  }

  /**
   * メールアドレスエラーが表示されているか
   */
  async hasEmailError(): Promise<boolean> {
    return this.emailError.isVisible()
  }

  /**
   * パスワードエラーが表示されているか
   */
  async hasPasswordError(): Promise<boolean> {
    return this.passwordError.isVisible()
  }

  /**
   * ログインボタンが有効か
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    return this.submitButton.isEnabled()
  }

  /**
   * ログインボタンのテキストを取得
   */
  async getSubmitButtonText(): Promise<string | null> {
    return this.submitButton.textContent()
  }

  /**
   * パスワードを忘れた方リンクが表示されているか
   */
  async hasForgotPasswordLink(): Promise<boolean> {
    return this.forgotPasswordLink.isVisible()
  }

  /**
   * 新規登録リンクが表示されているか
   */
  async hasSignupLink(): Promise<boolean> {
    return this.signupLink.isVisible()
  }

  /**
   * 過去ログインアカウント一覧が表示されているか
   */
  async hasRecentAccountsList(): Promise<boolean> {
    return this.recentAccountsList.isVisible()
  }

  /**
   * マイページへのリダイレクトを待機
   */
  async waitForRedirectToMypage(timeout = 10000): Promise<void> {
    await this.page.waitForURL('/mypage', { timeout })
  }

  /**
   * エラーアラートが表示されるまで待機
   */
  async waitForErrorAlert(timeout = 10000): Promise<void> {
    await this.errorAlert.first().waitFor({ state: 'visible', timeout })
  }

  /**
   * ページのスクリーンショットを取得
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true })
  }
}
