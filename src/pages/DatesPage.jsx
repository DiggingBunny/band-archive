import { useState, useEffect } from 'react';
import { getAllVideos, deleteVideo } from '../lib/api';
import VideoCard from '../components/VideoCard';
import MultiSelect from '../components/MultiSelect';

export default function DatesPage() {
  const [allVideos, setAllVideos] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      const data = await getAllVideos();
      setAllVideos(data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  }

  const dateOptions = [...new Set(allVideos.map(v => v.date))]
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({ value: date, label: formatDate(date) }));

  const filtered = selectedDates.length === 0
    ? allVideos
    : allVideos.filter(v => selectedDates.includes(v.date));

  const sorted = [...filtered].sort((a, b) => {
    const songCompare = a.song_name.localeCompare(b.song_name);
    if (songCompare !== 0) return songCompare;
    return (a.take || 0) - (b.take || 0);
  });

  async function handleDelete(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteVideo(id);
      setAllVideos(allVideos.filter(v => v.id !== id));
    } catch (err) {
      alert('삭제 실패: ' + err.message);
    }
  }

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="page">
      <h1>일자별 조회</h1>
      <MultiSelect
        label="일자 선택"
        options={dateOptions}
        selected={selectedDates}
        onChange={setSelectedDates}
        placeholder="일자를 선택하세요 (복수 선택 가능)"
      />
      <p className="sub-info">총 {sorted.length}개의 영상</p>
      {sorted.length === 0 ? (
        <p className="empty-message">등록된 영상이 없습니다.</p>
      ) : (
        <div className="video-grid">
          {sorted.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onDelete={handleDelete}
              onUpdate={(updated) => setAllVideos(allVideos.map(v => v.id === updated.id ? updated : v))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
