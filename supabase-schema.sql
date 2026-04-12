-- Supabase SQL Editor에서 실행하세요
-- 1. videos 테이블 생성
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  song_name TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS (Row Level Security) 설정 - 누구나 읽기/쓰기 가능
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert videos"
  ON videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete videos"
  ON videos FOR DELETE
  USING (true);

-- 3. 인덱스 (조회 성능 향상)
CREATE INDEX idx_videos_song_name ON videos(song_name);
CREATE INDEX idx_videos_date ON videos(date);
