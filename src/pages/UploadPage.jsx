import { useState, useEffect } from 'react';
import { addVideo, getSongList, extractYoutubeId } from '../lib/api';

export default function UploadPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    artist: '',
    songName: '',
    youtubeUrl: '',
    memo: '',
  });
  const [existingSongs, setExistingSongs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    getSongList().then(setExistingSongs).catch(console.error);
  }, []);

  useEffect(() => {
    const id = extractYoutubeId(form.youtubeUrl);
    setPreview(id);
  }, [form.youtubeUrl]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.artist.trim() || !form.songName.trim() || !form.youtubeUrl.trim()) {
      setMessage({ type: 'error', text: '가수명, 곡명, YouTube URL을 입력해주세요.' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await addVideo(form);
      setMessage({ type: 'success', text: '영상이 등록되었습니다!' });
      setForm({ ...form, artist: '', songName: '', youtubeUrl: '', memo: '' });
      setPreview(null);
      // 곡 목록 갱신
      const songs = await getSongList();
      setExistingSongs(songs);
    } catch (err) {
      setMessage({ type: 'error', text: '등록 실패: ' + err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>영상 업로드</h1>
      <div className="upload-guide">
        <h3>업로드 방법</h3>
        <ol>
          <li>합주 영상을 YouTube에 업로드 (비공개 또는 일부공개 권장)</li>
          <li>아래 폼에 일자, 곡명, YouTube 링크를 입력</li>
          <li>등록 완료!</li>
        </ol>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">합주 일자</label>
          <input
            type="date"
            id="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">가수</label>
          <input
            type="text"
            id="artist"
            name="artist"
            value={form.artist}
            onChange={handleChange}
            placeholder="가수명을 입력하세요"
            list="artist-list"
            required
          />
          <datalist id="artist-list">
            {[...new Set(existingSongs.map(s => s.artist).filter(Boolean))].map(artist => (
              <option key={artist} value={artist} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="songName">곡명</label>
          <input
            type="text"
            id="songName"
            name="songName"
            value={form.songName}
            onChange={handleChange}
            placeholder="곡명을 입력하세요"
            list="song-list"
            required
          />
          <datalist id="song-list">
            {existingSongs.map(s => (
              <option key={`${s.artist}-${s.songName}`} value={s.songName} />
            ))}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="youtubeUrl">YouTube URL</label>
          <input
            type="url"
            id="youtubeUrl"
            name="youtubeUrl"
            value={form.youtubeUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
            required
          />
        </div>

        {preview && (
          <div className="preview-wrapper">
            <label>미리보기</label>
            <iframe
              src={`https://www.youtube.com/embed/${preview}`}
              title="미리보기"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="memo">메모 (선택)</label>
          <textarea
            id="memo"
            name="memo"
            value={form.memo}
            onChange={handleChange}
            placeholder="예: BPM 120으로 연습, 브릿지 부분 재확인 필요"
            rows={3}
          />
        </div>

        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? '등록 중...' : '영상 등록'}
        </button>
      </form>
    </div>
  );
}
