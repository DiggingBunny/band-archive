import { useState, useEffect } from 'react';
import { getSongList, getVideosBySong, deleteVideo } from '../lib/api';
import VideoCard from '../components/VideoCard';

export default function SongsPage() {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);

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

  async function handleSelect(songName) {
    if (selectedSong === songName) {
      setSelectedSong(null);
      setVideos([]);
      return;
    }
    setSelectedSong(songName);
    setVideosLoading(true);
    try {
      const data = await getVideosBySong(songName);
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

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="page">
      <h1>곡별 조회</h1>
      {songs.length === 0 ? (
        <p className="empty-message">등록된 곡이 없습니다.</p>
      ) : (
        <>
          <div className="chip-list">
            {songs.map(song => (
              <button
                key={`${song.artist}-${song.songName}`}
                className={`chip ${selectedSong === song.songName ? 'chip-active' : ''}`}
                onClick={() => handleSelect(song.songName)}
              >
                {song.artist && `${song.artist} - `}{song.songName}
              </button>
            ))}
          </div>

          {selectedSong && (
            <div className="chip-result">
              <p className="sub-info">{selectedSong} — 총 {videos.length}개의 영상</p>
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
