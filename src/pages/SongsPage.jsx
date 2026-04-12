import { useState, useEffect } from 'react';
import { getSongList, getVideosBySong, deleteVideo } from '../lib/api';
import VideoCard from '../components/VideoCard';

export default function SongsPage() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    try {
      const data = await getSongList();
      setSongs(data);
    } catch (err) {
      console.error('Failed to load songs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function selectSong(song) {
    setSelectedSong(song);
    setLoading(true);
    try {
      const data = await getVideosBySong(song);
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

  if (loading && !selectedSong) return <div className="loading">로딩 중...</div>;

  return (
    <div className="page">
      <h1>곡별 조회</h1>
      {!selectedSong ? (
        <>
          {songs.length === 0 ? (
            <p className="empty-message">등록된 곡이 없습니다.</p>
          ) : (
            <div className="list-grid">
              {songs.map(song => (
                <button key={`${song.artist}-${song.songName}`} className="list-card" onClick={() => selectSong(song.songName)}>
                  <span className="list-icon">🎵</span>
                  <span className="list-title">{song.artist && `${song.artist} - `}{song.songName}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <button className="btn-back" onClick={() => setSelectedSong(null)}>
            ← 곡 목록으로
          </button>
          <h2>{selectedSong}</h2>
          <p className="sub-info">총 {videos.length}개의 영상</p>
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : (
            <div className="video-grid">
              {videos.map(video => (
                <VideoCard key={video.id} video={video} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
