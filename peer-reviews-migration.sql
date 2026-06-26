-- 꼬리물기(피어리뷰) 기능용 테이블
-- Supabase 대시보드 → SQL Editor 에서 1회 실행하세요.

CREATE TABLE peer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,        -- 합주 날짜 (날짜당 1개 배정)
  chain TEXT[] NOT NULL,            -- 감독 고리 순서: [A, B, C, D, E] → A가 B를, B가 C를 ... E가 A를 봐줌
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: 누구나 읽기/쓰기 가능 (기존 videos/comments 정책과 동일)
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
