import { useState, useEffect } from 'react';
import { addVideo, checkDuplicate, getSongList, getUploaderList, extractYoutubeId } from '../lib/api';
import ComboBox from '../components/ComboBox';

export default function UploadPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    artist: '',
    songName: '',
    take: '',
    youtubeUrl: '',
    memo: '',
    uploadedBy: '',
  });
  const [existingSongs, setExistingSongs] = useState([]);
  const [existingUploaders, setExistingUploaders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    getSongList().then(setExistingSongs).catch(console.error);
    getUploaderList().then(setExistingUploaders).catch(console.error);
  }, []);

  useEffect(() => {
    const id = extractYoutubeId(form.youtubeUrl);
    setPreview(id);
  }, [form.youtubeUrl]);

  // 고유 가수 목록
  const artistOptions = [...new Set(existingSongs.map(s => s.artist).filter(Boolean))];

  // 선택된 가수의 곡 목록 + 전체 곡 목록
  const songOptions = form.artist
    ? [...new Set(existingSongs.filter(s => s.artist === form.artist).map(s => s.songName))]
    : [...new Set(existingSongs.map(s => s.songName))];

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleArtistChange(value) {
    setForm({ ...form, artist: value, songName: '' });
  }

  function handleSongChange(value) {
    // 곡을 선택하면 해당 곡의 가수를 자동 채우기
    if (value && !form.artist) {
      const match = existingSongs.find(s => s.songName === value);
      if (match && match.artist) {
        setForm({ ...form, songName: value, artist: match.artist });
        return;
      }
    }
    setForm({ ...form, songName: value });
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
      const dup = await checkDuplicate(form.youtubeUrl);
      if (dup) {
        const dupInfo = `${dup.artist ? dup.artist + ' - ' : ''}${dup.song_name} (${dup.date})`;
        setMessage({ type: 'error', text: `이미 등록된 영상입니다: ${dupInfo}` });
        setSubmitting(false);
        return;
      }
      await addVideo(form);
      setMessage({ type: 'success', text: '영상이 등록되었습니다!' });
      setForm({ ...form, take: '', youtubeUrl: '' });
      setPreview(null);
      const [songs, uploaders] = await Promise.all([getSongList(), getUploaderList()]);
      setExistingSongs(songs);
      setExistingUploaders(uploaders);
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
          <li>아래 폼에 일자, 가수, 곡명, YouTube 링크를 입력</li>
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

        <ComboBox
          label="가수"
          value={form.artist}
          onChange={handleArtistChange}
          options={artistOptions}
          placeholder="가수명을 입력하세요"
        />

        <ComboBox
          label="곡명"
          value={form.songName}
          onChange={handleSongChange}
          options={songOptions}
          placeholder="곡명을 입력하세요"
        />

        <div className="form-group">
          <label htmlFor="take">Take</label>
          <input
            type="number"
            id="take"
            name="take"
            value={form.take}
            onChange={handleChange}
            placeholder="테이크 숫자를 입력하세요 (예: 1, 2, 3)"
            min="1"
          />
          <small>같은 날 같은 곡을 여러 번 합주했을 때 구분용 (선택)</small>
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
          <small>⚠️ YouTube 공개 범위를 '비공개'로 설정하면 본인 외에는 재생이 불가합니다. 반드시 <strong>'일부공개(미등록)'</strong>로 설정해주세요.</small>
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

        <ComboBox
          label="업로드한 사람"
          value={form.uploadedBy}
          onChange={(value) => setForm({ ...form, uploadedBy: value })}
          options={existingUploaders}
          placeholder="이름을 입력하세요"
        />

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
