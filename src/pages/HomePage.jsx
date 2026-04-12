import { useState, useEffect } from 'react';
import { getAllVideos, deleteVideo } from '../lib/api';
import VideoCard from '../components/VideoCard';

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    try {
      const data = await getAllVideos();
      setVideos(data);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
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

  const filtered = videos.filter(v =>
    v.song_name.toLowerCase().includes(search.toLowerCase()) ||
    (v.artist && v.artist.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="page">
      <h1>전체 영상</h1>
      <a
        href="https://www.youtube.com/watch?v=giVdR6h3_gE&list=PLTcsmS_HCQAh3QGs-fc9feBo8KwxQC684"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-playlist"
      >
        카카포밴드 선곡용 플레이리스트 바로가기
      </a>
      <input
        type="text"
        className="search-input"
        placeholder="가수명 또는 곡명으로 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p className="empty-message">
          {videos.length === 0
            ? '아직 등록된 영상이 없습니다. 업로드 탭에서 첫 영상을 등록해보세요!'
            : '검색 결과가 없습니다.'}
        </p>
      ) : (
        <div className="video-grid">
          {filtered.map(video => (
            <VideoCard key={video.id} video={video} onDelete={handleDelete} onUpdate={(updated) => setVideos(videos.map(v => v.id === updated.id ? updated : v))} />
          ))}
        </div>
      )}
    </div>
  );
}
