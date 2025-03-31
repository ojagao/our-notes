-- D1データベースのスキーマ定義

-- ショッピングノートテーブル
CREATE TABLE IF NOT EXISTS shopping_notes (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- マップノートテーブル
CREATE TABLE IF NOT EXISTS map_notes (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- カレンダーノートテーブル
CREATE TABLE IF NOT EXISTS calendar_notes (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL
);
