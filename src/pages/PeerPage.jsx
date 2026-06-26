import { useState, useEffect } from 'react';
import { getPeerReview, savePeerReview } from '../lib/api';

const POSITIONS = [
  { id: '기타', emoji: '🎸' },
  { id: '건반', emoji: '🎹' },
  { id: '보컬', emoji: '🎤' },
  { id: '드럼', emoji: '🥁' },
  { id: '베이스', emoji: '🎻' },
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

  async function handleStart() {
    if (chain && !confirm('이미 배정된 결과가 있습니다. 다시 섞을까요?')) return;
    setSaving(true);
    try {
      const newChain = shuffle(POSITIONS.map(p => p.id));
      await savePeerReview(date, newChain);
      setChain(newChain);
    } catch (err) {
      alert('저장 실패: ' + err.message);
    } finally {
      setSaving(false);
    }
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
          <p className="peer-result-date">{formatDate(date)} 감독 배정</p>
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
