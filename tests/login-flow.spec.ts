/**
 * @fileoverview ログインE2E統合テスト
 * @module tests/login-flow.spec
 *
 * EC-275: ログイン画面E2E
 * フロントエンド（EC-273）とバックエンド（EC-274）の統合テスト
 *
 * organization-standards準拠:
 * - Page Object Modelパターン
 * - 明示的待機（sleepではなく要素の出現を待つ）
 * - テストの独立性
 * - 失敗時のスクリーンショット（Playwright設定で自動）
 */

import { test, expect } from '@playwright/test'
import { LoginPage } from './pages'

/**
 * テストユーザー情報
 * バックエンドのシードデータに存在するユーザー
 */
const TEST_USER = {
  email: 'test@docomo.ne.jp',
  password: 'password123',
}

const INVALID_USER = {
  email: 'invalid@docomo.ne.jp',
  password: 'wrongpassword',
}

test.describe('ログインE2E統合テスト (EC-275)', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test.describe('ページ表示', () => {
    test('ログインページにアクセスするとページタイトルが表示される', async () => {
      const title = await loginPage.getPageTitle()
      expect(title).toBe('ログイン')
    })

    test('メールアドレス入力フィールドが表示される', async () => {
      await expect(loginPage.emailInput).toBeVisible()
    })

    test('パスワード入力フィールドが表示される', async () => {
      await expect(loginPage.passwordInput).toBeVisible()
    })

    test('ログインボタンが表示される', async () => {
      await expect(loginPage.submitButton).toBeVisible()
    })

    test('パスワードを忘れた方リンクが表示される', async () => {
      const hasLink = await loginPage.hasForgotPasswordLink()
      expect(hasLink).toBe(true)
    })

    test('新規登録リンクが表示される', async () => {
      const hasLink = await loginPage.hasSignupLink()
      expect(hasLink).toBe(true)
    })
  })

  test.describe('正常ログインフロー', () => {
    test('正常ログインフローでマイページにリダイレクト', async () => {
      await loginPage.login(TEST_USER.email, TEST_USER.password)
      await loginPage.waitForRedirectToMypage()
      expect(loginPage.page.url()).toContain('/mypage')
    })

    test('ログイン状態を保持するチェックボックスを選択してログイン', async () => {
      await loginPage.login(TEST_USER.email, TEST_USER.password, true)
      await loginPage.waitForRedirectToMypage()
      expect(loginPage.page.url()).toContain('/mypage')
    })
  })

  test.describe('ログイン失敗フロー', () => {
    test('無効な認証情報でログイン失敗エラーが表示される', async () => {
      await loginPage.login(INVALID_USER.email, INVALID_USER.password)
      await loginPage.waitForErrorAlert()

      const isErrorVisible = await loginPage.isErrorAlertVisible()
      expect(isErrorVisible).toBe(true)
    })

    test('存在しないメールアドレスでログイン失敗', async () => {
      await loginPage.login('nonexistent@docomo.ne.jp', 'password123')
      await loginPage.waitForErrorAlert()

      const isErrorVisible = await loginPage.isErrorAlertVisible()
      expect(isErrorVisible).toBe(true)
    })

    test('間違ったパスワードでログイン失敗', async () => {
      await loginPage.login(TEST_USER.email, 'wrongpassword')
      await loginPage.waitForErrorAlert()

      const isErrorVisible = await loginPage.isErrorAlertVisible()
      expect(isErrorVisible).toBe(true)
    })
  })

  test.describe('バリデーション', () => {
    test('空のフォームではログインボタンが無効', async () => {
      // フロントエンドの実装: mode: 'onChange'でバリデーション、ボタンはdisabled={!isValid}
      const isEnabled = await loginPage.isSubmitButtonEnabled()
      expect(isEnabled).toBe(false)
    })

    test('メールアドレスのみ入力してもログインボタンが無効', async () => {
      await loginPage.fillEmail(TEST_USER.email)

      // パスワードが空なのでボタンは無効のまま
      const isEnabled = await loginPage.isSubmitButtonEnabled()
      expect(isEnabled).toBe(false)
    })

    test('パスワードのみ入力してもログインボタンが無効', async () => {
      await loginPage.fillPassword('password123')

      // メールアドレスが空なのでボタンは無効のまま
      const isEnabled = await loginPage.isSubmitButtonEnabled()
      expect(isEnabled).toBe(false)
    })

    test('無効なメールアドレス形式ではログインボタンが無効', async () => {
      await loginPage.fillEmail('invalid-email')
      await loginPage.fillPassword('password123')

      // メールアドレス形式が無効なのでボタンは無効のまま
      const isEnabled = await loginPage.isSubmitButtonEnabled()
      expect(isEnabled).toBe(false)
    })

    test('有効なメールアドレスとパスワードを入力するとログインボタンが有効', async () => {
      await loginPage.fillEmail(TEST_USER.email)
      await loginPage.fillPassword(TEST_USER.password)

      // 有効な入力なのでボタンは有効
      const isEnabled = await loginPage.isSubmitButtonEnabled()
      expect(isEnabled).toBe(true)
    })
  })

  test.describe('パスワード表示切替機能', () => {
    test('パスワード表示切替機能が動作する', async () => {
      await loginPage.fillPassword('password123')

      // 初期状態はパスワードが非表示
      let fieldType = await loginPage.getPasswordFieldType()
      expect(fieldType).toBe('password')

      // 表示に切り替え
      await loginPage.togglePasswordVisibility()
      fieldType = await loginPage.getPasswordFieldType()
      expect(fieldType).toBe('text')

      // 非表示に戻す
      await loginPage.togglePasswordVisibility()
      fieldType = await loginPage.getPasswordFieldType()
      expect(fieldType).toBe('password')
    })
  })

  test.describe('UI状態', () => {
    test('初期状態でログインボタンのテキストが正しい', async () => {
      // 有効な入力を行ってボタンを有効化
      await loginPage.fillEmail(TEST_USER.email)
      await loginPage.fillPassword(TEST_USER.password)

      // ボタンテキストを確認
      const buttonText = await loginPage.getSubmitButtonText()
      expect(buttonText).toBe('ログイン')
    })

    test('ログイン成功後にマイページにリダイレクトされる', async () => {
      await loginPage.login(TEST_USER.email, TEST_USER.password)
      await loginPage.waitForRedirectToMypage()
      expect(loginPage.page.url()).toContain('/mypage')
    })
  })
})

test.describe('レスポンシブデザイン (EC-275)', () => {
  test('モバイル表示でもログインフォームが正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.submitButton).toBeVisible()
  })

  test('タブレット表示でもログインフォームが正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.submitButton).toBeVisible()
  })
})

test.describe('アクセシビリティ (EC-275)', () => {
  test('フォーム要素にラベルが関連付けられている', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    // メールアドレスフィールドにaria-labelがある
    const emailAriaLabel = await loginPage.emailInput.getAttribute('aria-label')
    expect(emailAriaLabel).toBeTruthy()

    // パスワードフィールドにaria-labelがある
    const passwordAriaLabel = await loginPage.passwordInput.getAttribute('aria-label')
    expect(passwordAriaLabel).toBeTruthy()
  })

  test('エラーメッセージにrole="alert"が設定されている', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await loginPage.login(INVALID_USER.email, INVALID_USER.password)
    await loginPage.waitForErrorAlert()

    const alertRole = await loginPage.errorAlert.first().getAttribute('role')
    expect(alertRole).toBe('alert')
  })
})
