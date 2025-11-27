/**
 * @fileoverview APIレスポンス検証E2Eテスト
 * @module tests/api-validation.spec
 *
 * EC-271: iPhoneカテゴリページE2Eテスト自動化
 *
 * APIレスポンスとUI表示の整合性を検証するテスト。
 * requestIdによるリクエスト追跡機能を含む。
 *
 * organization-standards準拠:
 * - APIレスポンスの検証
 * - UI-API整合性チェック
 * - requestIdトレーシング
 */

import { test, expect } from '@playwright/test'
import { IPhoneCategoryPage } from './pages'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'

/**
 * APIレスポンスの型定義
 * バックエンドAPIはsnake_caseで返すため、型定義もsnake_caseに合わせる
 */
interface CategoryDetailResponse {
  success: boolean
  message: string
  data: {
    category: {
      category_code: string
      display_name: string
      hero_image_url: string | null
      lead_text: string | null
    }
    products: Array<{
      product_id: number
      product_name: string
      description: string
      price: number
      manufacturer: string
      model_name: string
      storage_capacity: string
      color_code: string
      color_name: string
      image_urls: string[]
      campaigns: Array<{
        campaign_code: string
        badge_text: string
      }>
    }>
    meta: {
      pagination: {
        page: number
        per_page: number
        total: number
        pages: number
      }
    }
  }
  timestamp: string
  request_id: string
}

test.describe('APIレスポンス検証 (EC-271)', () => {
  test.describe('カテゴリ詳細API', () => {
    test('iPhoneカテゴリAPIが正常なレスポンスを返す', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone`)

      expect(response.ok()).toBe(true)
      expect(response.status()).toBe(200)

      const data: CategoryDetailResponse = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.category.category_code).toBe('iphone')
      expect(data.request_id).toBeDefined()
      expect(data.timestamp).toBeDefined()
    })

    test('APIレスポンスにrequest_idが含まれる', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone`)
      const data: CategoryDetailResponse = await response.json()

      expect(data.request_id).toBeDefined()
      expect(typeof data.request_id).toBe('string')
      expect(data.request_id.length).toBeGreaterThan(0)
    })

    test('ページネーションパラメータが正しく動作する', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?page=0&size=2`)
      const data: CategoryDetailResponse = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.meta.pagination.page).toBe(0)
      expect(data.data.meta.pagination.per_page).toBe(2)
      expect(data.data.products.length).toBeLessThanOrEqual(2)
    })

    test('ソートパラメータが正しく動作する', async ({ request }) => {
      const responseByName = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?sort=name&order=asc`)
      const dataByName: CategoryDetailResponse = await responseByName.json()

      const responseByPrice = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?sort=price&order=desc`)
      const dataByPrice: CategoryDetailResponse = await responseByPrice.json()

      expect(dataByName.success).toBe(true)
      expect(dataByPrice.success).toBe(true)

      if (dataByName.data.products.length > 1) {
        const names = dataByName.data.products.map(p => p.product_name)
        const sortedNames = [...names].sort()
        expect(names).toEqual(sortedNames)
      }

      if (dataByPrice.data.products.length > 1) {
        const prices = dataByPrice.data.products.map(p => p.price)
        for (let i = 0; i < prices.length - 1; i++) {
          expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1])
        }
      }
    })

    test('存在しないカテゴリに対して404を返す', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/nonexistent`)
      expect(response.status()).toBe(404)
    })
  })
})

test.describe('APIレスポンスとUI表示の整合性 (EC-271)', () => {
  // フロントエンドがAPI連携するまでスキップ（EC-272で対応予定）
  test.skip('APIから取得した製品数とUI表示が一致する', async ({ page, request }) => {
    const apiResponse = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone`)
    const apiData: CategoryDetailResponse = await apiResponse.json()

    const iPhonePage = new IPhoneCategoryPage(page)
    await iPhonePage.goto()

    const uiProductCount = await iPhonePage.getProductCardCount()

    expect(uiProductCount).toBe(apiData.data.products.length)
  })

  // フロントエンドがAPI連携するまでスキップ（EC-272で対応予定）
  test.skip('APIから取得した製品名がUIに表示される', async ({ page, request }) => {
    const apiResponse = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone`)
    const apiData: CategoryDetailResponse = await apiResponse.json()

    const iPhonePage = new IPhoneCategoryPage(page)
    await iPhonePage.goto()

    for (const product of apiData.data.products) {
      const isVisible = await iPhonePage.isProductVisible(product.product_name)
      expect(isVisible).toBe(true)
    }
  })

  test('APIのrequest_idがレスポンスボディに含まれる', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone`)
    const data: CategoryDetailResponse = await response.json()

    expect(data.request_id).toBeDefined()
    console.info(`Request ID: ${data.request_id}`)
  })
})

test.describe('フィルター機能API検証 (EC-271)', () => {
  test('キーワード検索が正しく動作する', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?keyword=Pro`)
    const data: CategoryDetailResponse = await response.json()

    expect(data.success).toBe(true)

    if (data.data.products.length > 0) {
      for (const product of data.data.products) {
        expect(product.product_name.toLowerCase()).toContain('pro')
      }
    }
  })

  test.skip('ストレージフィルターが正しく動作する', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?storageCapacity=256GB`)
    const data: CategoryDetailResponse = await response.json()

    expect(data.success).toBe(true)
  })

  test.skip('カラーフィルターが正しく動作する', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?colorCode=black`)
    const data: CategoryDetailResponse = await response.json()

    expect(data.success).toBe(true)
  })

  test.skip('価格範囲フィルターが正しく動作する', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?minPrice=100000&maxPrice=150000`)
    const data: CategoryDetailResponse = await response.json()

    expect(data.success).toBe(true)

    for (const product of data.data.products) {
      expect(product.price).toBeGreaterThanOrEqual(100000)
      expect(product.price).toBeLessThanOrEqual(150000)
    }
  })
})

test.describe('エラーハンドリング検証 (EC-271)', () => {
  test('不正なページ番号に対してエラーを返す', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?page=-1`)
    expect(response.status()).toBe(400)
  })

  test('不正なページサイズに対してエラーを返す', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?size=0`)
    expect(response.status()).toBe(400)
  })

  test('ページサイズ上限を超えた場合にエラーを返す', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/v1/products/categories/iphone?size=101`)
    expect(response.status()).toBe(400)
  })
})
