-- Supabase SQL Editor에서 실행하세요
-- 1. videos 테이블 생성
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  artist TEXT,
  song_name TEXT NOT NULL,
  take INTEGER,
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

-- 3. comments 테이블 생성
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete comments"
  ON comments FOR DELETE
  USING (true);

-- 4. 인덱스 (조회 성능 향상)
CREATE INDEX idx_videos_song_name ON videos(song_name);
CREATE INDEX idx_videos_date ON videos(date);
CREATE INDEX idx_comments_video_id ON comments(video_id);
