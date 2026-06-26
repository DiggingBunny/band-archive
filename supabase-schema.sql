-- Supabase SQL Editor에서 실행하세요
-- 1. videos 테이블 생성
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  artist TEXT,
  song_name TEXT NOT NULL,
  take INTEGER,
  uploaded_by TEXT,
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

-- 5. peer_reviews 테이블 (꼬리물기 - 합주별 감독 배정)
CREATE TABLE peer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  chain TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read peer_reviews"
  ON peer_reviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert peer_reviews"
  ON peer_reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update peer_reviews"
  ON peer_reviews FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete peer_reviews"
  ON peer_reviews FOR DELETE
  USING (true);
