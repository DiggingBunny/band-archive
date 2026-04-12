import { useState, useEffect } from 'react';
import { getAllVideos, deleteVideo } from '../lib/api';
import VideoCard from '../components/VideoCard';
import MultiSelect from '../components/MultiSelect';

export default function SongsPage() {
  const [allVideos, setAllVideos] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [dateAsc, setDateAsc] = useState(false);
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

  const songOptions = [...new Map(
    allVideos.map(v => [v.song_name, {
      value: v.song_name,
      label: v.artist ? `${v.artist} - ${v.song_name}` : v.song_name,
    }])
  ).values()].sort((a, b) => a.label.localeCompare(b.label));

  const filtered = selectedSongs.length === 0
    ? allVideos
    : allVideos.filter(v => selectedSongs.includes(v.song_name));

  const sorted = [...filtered].sort((a, b) => {
    const dateCompare = dateAsc
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
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
      <h1>곡별 조회</h1>
      <MultiSelect
        label="곡 선택"
        options={songOptions}
        selected={selectedSongs}
        onChange={setSelectedSongs}
        placeholder="곡을 선택하세요 (복수 선택 가능)"
      />
      <div className="filter-bar">
        <p className="sub-info">총 {sorted.length}개의 영상</p>
        <button className="btn-sort" onClick={() => setDateAsc(!dateAsc)}>
          일자 {dateAsc ? '오래된순 ▲' : '최신순 ▼'}
        </button>
      </div>
      {sorted.length === 0 ? (
        <p className="empty-message">등록된 영상이 없습니다.</p>
      ) : (
        <div className="video-list">
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
