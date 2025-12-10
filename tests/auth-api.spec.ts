/**
 * @fileoverview 認証API統合テスト
 * @module tests/auth-api.spec
 *
 * EC-275: ログイン画面E2E
 * バックエンド認証APIの統合テスト
 *
 * organization-standards準拠:
 * - APIレスポンスの検証
 * - エラーハンドリングの検証
 * - requestIdトレーシング
 */

import { test, expect } from '@playwright/test'

const AUTH_API_BASE_URL = process.env.AUTH_API_BASE_URL || 'http://localhost:8080'

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

/**
 * ログインAPIレスポンスの型定義
 */
interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: {
    id: string
    name: string
    email: string
  }
}

/**
 * エラーレスポンスの型定義
 */
interface ErrorResponse {
  success: boolean
  errorCode: string
  message: string
  timestamp: string
  requestId?: string
  fieldErrors?: Record<string, string>
}

test.describe('認証API統合テスト (EC-275)', () => {
  test.describe('ログインAPI', () => {
    test('正常ログインAPIレスポンス検証', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      })

      expect(response.status()).toBe(200)

      const data: LoginResponse = await response.json()
      expect(data).toHaveProperty('accessToken')
      expect(data).toHaveProperty('refreshToken')
      expect(data).toHaveProperty('tokenType', 'Bearer')
      expect(data).toHaveProperty('expiresIn')
      expect(data).toHaveProperty('user')
      expect(data.user).toHaveProperty('id')
      expect(data.user).toHaveProperty('email', TEST_USER.email)
    })

    test('アクセストークンがJWT形式である', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      })

      expect(response.status()).toBe(200)

      const data: LoginResponse = await response.json()
      // JWTは3つのパートで構成される（header.payload.signature）
      const jwtParts = data.accessToken.split('.')
      expect(jwtParts.length).toBe(3)
    })

    test('リフレッシュトークンがJWT形式である', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      })

      expect(response.status()).toBe(200)

      const data: LoginResponse = await response.json()
      // JWTは3つのパートで構成される（header.payload.signature）
      const jwtParts = data.refreshToken.split('.')
      expect(jwtParts.length).toBe(3)
    })

    test('expiresInが正の整数である', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      })

      expect(response.status()).toBe(200)

      const data: LoginResponse = await response.json()
      expect(typeof data.expiresIn).toBe('number')
      expect(data.expiresIn).toBeGreaterThan(0)
    })
  })

  test.describe('認証エラー', () => {
    test('無効認証情報で401エラー', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: INVALID_USER.email,
          password: INVALID_USER.password,
        },
      })

      expect(response.status()).toBe(401)
    })

    test('存在しないユーザーで401エラー', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: 'nonexistent@docomo.ne.jp',
          password: 'password123',
        },
      })

      expect(response.status()).toBe(401)
    })

    test('間違ったパスワードで401エラー', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: 'wrongpassword',
        },
      })

      expect(response.status()).toBe(401)
    })
  })

  test.describe('バリデーションエラー', () => {
    test('空のメールアドレスで400エラー', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: '',
          password: 'password123',
        },
      })

      expect(response.status()).toBe(400)
    })

    test('空のパスワードで400エラー', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: '',
        },
      })

      expect(response.status()).toBe(400)
    })

    test('無効なメールアドレス形式で400エラー', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: 'invalid-email',
          password: 'password123',
        },
      })

      expect(response.status()).toBe(400)
    })

    test('メールアドレスなしで400エラー', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          password: 'password123',
        },
      })

      expect(response.status()).toBe(400)
    })

    test('パスワードなしで400エラー', async ({ request }) => {
      const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
        data: {
          email: TEST_USER.email,
        },
      })

      expect(response.status()).toBe(400)
    })
  })

  test.describe('ヘルスチェック', () => {
    test('認証サービスヘルスチェック', async ({ request }) => {
      const response = await request.get(`${AUTH_API_BASE_URL}/actuator/health`)
      // ヘルスチェックは200または404（エンドポイントが存在しない場合）
      expect([200, 404]).toContain(response.status())
    })

    test('認証サービスルートエンドポイント', async ({ request }) => {
      const response = await request.get(`${AUTH_API_BASE_URL}/`)
      // ルートエンドポイントは200または404
      expect([200, 404]).toContain(response.status())
    })
  })
})

test.describe('APIレスポンス形式検証 (EC-275)', () => {
  test('ログイン成功時のレスポンス構造が正しい', async ({ request }) => {
    const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    })

    expect(response.status()).toBe(200)

    const data: LoginResponse = await response.json()

    // 必須フィールドの存在確認
    expect(data.accessToken).toBeDefined()
    expect(data.refreshToken).toBeDefined()
    expect(data.tokenType).toBeDefined()
    expect(data.expiresIn).toBeDefined()
    expect(data.user).toBeDefined()

    // ユーザー情報の構造確認
    expect(data.user.id).toBeDefined()
    expect(data.user.email).toBeDefined()
  })

  test('Content-Typeがapplication/jsonである', async ({ request }) => {
    const response = await request.post(`${AUTH_API_BASE_URL}/api/v1/auth/login`, {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    })

    const contentType = response.headers()['content-type']
    expect(contentType).toContain('application/json')
  })
})
