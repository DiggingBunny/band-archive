import { useState } from 'react';

const POSITIONS = [
  { id: '기타', emoji: '🎸' },
  { id: '건반', emoji: '🎹' },
  { id: '보컬', emoji: '🎤' },
  { id: '드럼', emoji: '🥁' },
  { id: '베이스', emoji: '🎸' },
];
const EMOJI = Object.fromEntries(POSITIONS.map(p => [p.id, p.emoji]));

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

export default function PeerPage() {
  const [chain, setChain] = useState(null);

  function handleStart() {
    setChain(shuffle(POSITIONS.map(p => p.id)));
  }

  return (
    <div className="page">
      <h1>🔗 오늘의 피어리뷰</h1>
      <p className="sub-info">
        합주 때마다 서로를 봐주는 감독을 그때그때 랜덤으로 정합니다. 각자 한 명을 감독하고, 한 명에게 감독받아요.
      </p>

      <div className="peer-controls">
        <button className="btn-start" onClick={handleStart}>
          {chain ? '다시 섞기' : 'START'}
        </button>
      </div>

      {!chain ? (
        <p className="empty-message">START를 누르면 오늘의 감독이 정해집니다.</p>
      ) : (
        <div className="peer-result">
          <p className="peer-result-date">오늘의 감독 배정</p>
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
