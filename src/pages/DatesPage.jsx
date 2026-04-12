import { useState, useEffect } from 'react';
import { getDateList, getVideosByDate, deleteVideo } from '../lib/api';
import VideoCard from '../components/VideoCard';

export default function DatesPage() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);

  useEffect(() => {
    loadDates();
  }, []);

  async function loadDates() {
    try {
      const data = await getDateList();
      setDates(data);
    } catch (err) {
      console.error('Failed to load dates:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(date) {
    if (selectedDate === date) {
      setSelectedDate(null);
      setVideos([]);
      return;
    }
    setSelectedDate(date);
    setVideosLoading(true);
    try {
      const data = await getVideosByDate(date);
      setVideos(data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setVideosLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteVideo(id);
      setVideos(videos.filter(v => v.id !== id));
    } catch (err) {
      alert('삭제 실패: ' + err.message);
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

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="page">
      <h1>일자별 조회</h1>
      {dates.length === 0 ? (
        <p className="empty-message">등록된 합주 일자가 없습니다.</p>
      ) : (
        <>
          <div className="chip-list">
            {dates.map(date => (
              <button
                key={date}
                className={`chip ${selectedDate === date ? 'chip-active' : ''}`}
                onClick={() => handleSelect(date)}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>

          {selectedDate && (
            <div className="chip-result">
              <p className="sub-info">{formatDate(selectedDate)} — 총 {videos.length}개의 영상</p>
              {videosLoading ? (
                <div className="loading">로딩 중...</div>
              ) : (
                <div className="video-grid">
                  {videos.map(video => (
                    <VideoCard key={video.id} video={video} onDelete={handleDelete} onUpdate={(updated) => setVideos(videos.map(v => v.id === updated.id ? updated : v))} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
