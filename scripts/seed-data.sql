-- EC-271: iPhoneカテゴリページE2Eテスト自動化
-- EC-275: ログイン画面E2E
-- テストデータシードスクリプト
--
-- このスクリプトはDocker Compose起動時に自動実行されます。
-- 注意: Flywayマイグレーションがテーブルを作成するため、
-- このスクリプトではデータ挿入のみを行います。

-- iPhoneカテゴリを挿入
INSERT INTO categories (category_code, display_name, hero_image_url, lead_text, display_order, is_active)
VALUES (
    'iphone',
    'iPhone',
    '/images/categories/iphone-hero.jpg',
    'Apple製の高品質なスマートフォン。最新のiOSと優れたカメラ性能。ahamoで使える最新iPhoneをご紹介します。',
    1,
    TRUE
) ON CONFLICT (category_code) DO NOTHING;

-- iPhone製品を挿入
INSERT INTO products (category_code, name, description, price, is_active) VALUES
('iphone', 'iPhone 16 Pro Max', '最新のA18 Proチップ搭載。最大のディスプレイと最長のバッテリー駆動時間。', 189800.00, TRUE),
('iphone', 'iPhone 16 Pro', '最新のA18 Proチップ搭載。プロ仕様のカメラシステム。', 159800.00, TRUE),
('iphone', 'iPhone 16 Plus', 'A18チップ搭載。大画面で楽しむエンターテインメント。', 134800.00, TRUE),
('iphone', 'iPhone 16', 'A18チップ搭載。進化したカメラとバッテリー。', 124800.00, TRUE),
('iphone', 'iPhone 15', 'A16 Bionicチップ搭載。お求めやすい価格で高性能。', 112800.00, TRUE)
ON CONFLICT DO NOTHING;

-- 製品バリアントを挿入
INSERT INTO product_variants (product_id, manufacturer, model_name, storage_capacity, color_code, color_name, image_urls)
SELECT 
    p.id,
    'Apple',
    p.name,
    '256GB',
    'natural-titanium',
    'ナチュラルチタニウム',
    '["/images/devices/iphone-16-pro-max.png"]'::jsonb
FROM products p WHERE p.name = 'iPhone 16 Pro Max'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, manufacturer, model_name, storage_capacity, color_code, color_name, image_urls)
SELECT 
    p.id,
    'Apple',
    p.name,
    '256GB',
    'natural-titanium',
    'ナチュラルチタニウム',
    '["/images/devices/iphone-16-pro.png"]'::jsonb
FROM products p WHERE p.name = 'iPhone 16 Pro'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, manufacturer, model_name, storage_capacity, color_code, color_name, image_urls)
SELECT 
    p.id,
    'Apple',
    p.name,
    '128GB',
    'black',
    'ブラック',
    '["/images/devices/iphone-16-plus.png"]'::jsonb
FROM products p WHERE p.name = 'iPhone 16 Plus'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, manufacturer, model_name, storage_capacity, color_code, color_name, image_urls)
SELECT 
    p.id,
    'Apple',
    p.name,
    '128GB',
    'black',
    'ブラック',
    '["/images/devices/iphone-16.png"]'::jsonb
FROM products p WHERE p.name = 'iPhone 16'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, manufacturer, model_name, storage_capacity, color_code, color_name, image_urls)
SELECT 
    p.id,
    'Apple',
    p.name,
    '128GB',
    'black',
    'ブラック',
    '["/images/devices/iphone-15.png"]'::jsonb
FROM products p WHERE p.name = 'iPhone 15'
ON CONFLICT DO NOTHING;

-- キャンペーンを挿入
INSERT INTO campaigns (campaign_code, campaign_name, badge_text, valid_from, valid_to, is_active) VALUES
('iphone-special-2024', 'iPhone特別キャンペーン2024', 'iPhone特別キャンペーン', '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE),
('new-device-discount', '新規契約割引キャンペーン', '新規契約割引', '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE)
ON CONFLICT (campaign_code) DO NOTHING;

-- 製品キャンペーン関連を挿入
INSERT INTO product_campaigns (product_id, campaign_id)
SELECT p.id, c.id
FROM products p, campaigns c
WHERE p.name LIKE 'iPhone 16%' AND c.campaign_code = 'iphone-special-2024'
ON CONFLICT DO NOTHING;

-- EC-275: テストユーザーを挿入
-- パスワード: password123 (BCryptハッシュ - Python bcryptで生成)
INSERT INTO users (email, name, password_hash) VALUES
('test@docomo.ne.jp', 'テストユーザー', '$2a$10$wmDe9bp/EIn/2LKOq/relOkF8DdZuoLW21j3QRnL2z7p886BZ3X3K')
ON CONFLICT (email) DO NOTHING;

-- 確認用クエリ
-- SELECT * FROM categories;
-- SELECT * FROM products;
-- SELECT * FROM product_variants;
-- SELECT * FROM campaigns;
-- SELECT * FROM product_campaigns;
-- SELECT * FROM users;
