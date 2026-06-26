import { useState, useEffect, useRef } from 'react';
import { getPeerReview, savePeerReview, getPeerReviewDates, deletePeerReview } from '../lib/api';

const POSITIONS = [
  { id: '기타', emoji: '🎸' },
  { id: '건반', emoji: '🎹' },
  { id: '보컬', emoji: '🎤' },
  { id: '드럼', emoji: '🥁' },
  { id: '베이스', emoji: '🎸' },
];
const EMOJI = Object.fromEntries(POSITIONS.map(p => [p.id, p.emoji]));

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 5개 포지션을 랜덤으로 섞어 고리(ring)를 만든다.
// 고리 안에서는 각자 딱 한 명을 감독하고 한 명에게만 감독받으므로,
// "A가 B의 감독이면 B는 A의 감독이 될 수 없다"는 조건이 자동으로 충족된다.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${weekday})`;
}

export default function PeerPage() {
  const [date, setDate] = useState(todayStr());
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reviewDates, setReviewDates] = useState([]);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  // 선택된 날짜의 배정 불러오기
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const row = await getPeerReview(date);
        if (!cancelled) setChain(row ? row.chain : null);
      } catch (err) {
        console.error('Failed to load peer review:', err);
        if (!cancelled) setChain(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [date]);

  // 피어리뷰가 있었던 날짜 목록 불러오기
  async function loadDates() {
    try {
      setReviewDates(await getPeerReviewDates());
    } catch (err) {
      console.error('Failed to load peer review dates:', err);
    }
  }

  useEffect(() => { loadDates(); }, []);

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleStart() {
    if (chain && !confirm('이미 배정된 결과가 있습니다. 다시 섞을까요?')) return;
    setSaving(true);
    try {
      const newChain = shuffle(POSITIONS.map(p => p.id));
      await savePeerReview(date, newChain);
      setChain(newChain);
      await loadDates();
    } catch (err) {
      alert('저장 실패: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`${formatDate(date)}의 피어리뷰를 삭제할까요?`)) return;
    setDeleting(true);
    try {
      await deletePeerReview(date);
      setChain(null);
      await loadDates();
    } catch (err) {
      alert('삭제 실패: ' + err.message);
    } finally {
      setDeleting(false);
    }
  }

  function pickDate(d) {
    setDate(d);
    setDropOpen(false);
  }

  return (
    <div className="page">
      <h1>🔗 오늘의 피어리뷰</h1>
      <p className="sub-info">
        합주 때마다 서로를 봐주는 감독을 자동으로 정합니다. 각자 한 명을 감독하고, 한 명에게 감독받아요.
      </p>

      <div className="peer-controls">
        <input
          type="date"
          className="peer-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="btn-start" onClick={handleStart} disabled={saving}>
          {saving ? '선정 중...' : chain ? '다시 섞기' : 'START'}
        </button>
      </div>

      {/* 이전 피어리뷰 드롭다운 칩 */}
      <div className="multi-select peer-history" ref={dropRef}>
        <div className="multi-select-trigger" onClick={() => setDropOpen(!dropOpen)}>
          <span className="multi-select-placeholder">
            📅 이전 피어리뷰 다시보기 ({reviewDates.length}개)
          </span>
          <div className="multi-select-actions">
            <span className="multi-select-arrow">{dropOpen ? '▲' : '▼'}</span>
          </div>
        </div>
        {dropOpen && (
          <div className="multi-select-dropdown">
            {reviewDates.length === 0 ? (
              <div className="multi-select-empty">아직 기록이 없습니다</div>
            ) : (
              <div className="peer-chip-list">
                {reviewDates.map(d => (
                  <button
                    key={d}
                    type="button"
                    className={d === date ? 'peer-date-chip active' : 'peer-date-chip'}
                    onClick={() => pickDate(d)}
                  >
                    {formatDate(d)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : !chain ? (
        <p className="empty-message">
          {formatDate(date)}
          <br />
          아직 피어가 정해지지 않았습니다. START를 눌러주세요.
        </p>
      ) : (
        <div className="peer-result">
          <div className="peer-result-head">
            <p className="peer-result-date">{formatDate(date)} 감독 배정</p>
            <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
          <div className="peer-chain">
            {chain.map((pos, i) => {
              const target = chain[(i + 1) % chain.length];
              return (
                <div key={pos} className="peer-row">
                  <span className="peer-pos supervisor">{EMOJI[pos]} {pos}</span>
                  <span className="peer-arrow">→</span>
                  <span className="peer-pos target">{EMOJI[target]} {target}</span>
                  <span className="peer-desc">{pos}이(가) {target}을(를) 봐줍니다</span>
                </div>
              );
            })}
          </div>
          <p className="peer-ring-note">
            {chain.map(p => `${EMOJI[p]} ${p}`).join(' → ')} → {EMOJI[chain[0]]} {chain[0]}
          </p>
        </div>
      )}
    </div>
  );
}
