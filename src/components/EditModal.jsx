import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateVideo, getSongList, getUploaderList, extractYoutubeId } from '../lib/api';
import ComboBox from './ComboBox';

export default function EditModal({ video, onClose, onSaved }) {
  const [form, setForm] = useState({
    date: video.date,
    artist: video.artist || '',
    songName: video.song_name,
    take: video.take || '',
    youtubeUrl: video.youtube_url,
    memo: video.memo || '',
    uploadedBy: video.uploaded_by || '',
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
    setPreview(extractYoutubeId(form.youtubeUrl));
  }, [form.youtubeUrl]);

  const artistOptions = [...new Set(existingSongs.map(s => s.artist).filter(Boolean))];
  const songOptions = form.artist
    ? [...new Set(existingSongs.filter(s => s.artist === form.artist).map(s => s.songName))]
    : [...new Set(existingSongs.map(s => s.songName))];

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
      const updated = await updateVideo(video.id, form);
      onSaved(updated);
    } catch (err) {
      setMessage({ type: 'error', text: '수정 실패: ' + err.message });
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>영상 정보 수정</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-date">합주 일자</label>
            <input type="date" id="edit-date" name="date" value={form.date} onChange={handleChange} required />
          </div>

          <ComboBox
            label="가수"
            value={form.artist}
            onChange={(v) => setForm({ ...form, artist: v, songName: '' })}
            options={artistOptions}
            placeholder="가수명을 입력하세요"
          />

          <ComboBox
            label="곡명"
            value={form.songName}
            onChange={(v) => setForm({ ...form, songName: v })}
            options={songOptions}
            placeholder="곡명을 입력하세요"
          />

          <div className="form-group">
            <label htmlFor="edit-take">Take</label>
            <input type="number" id="edit-take" name="take" value={form.take} onChange={handleChange} placeholder="테이크 숫자 (예: 1, 2, 3)" min="1" />
          </div>

          <div className="form-group">
            <label htmlFor="edit-youtubeUrl">YouTube URL</label>
            <input type="url" id="edit-youtubeUrl" name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} required />
          </div>

          {preview && (
            <div className="preview-wrapper">
              <label>미리보기</label>
              <iframe src={`https://www.youtube.com/embed/${preview}`} title="미리보기" frameBorder="0" allowFullScreen />
            </div>
          )}

          <ComboBox
            label="업로드한 사람"
            value={form.uploadedBy}
            onChange={(v) => setForm({ ...form, uploadedBy: v })}
            options={existingUploaders}
            placeholder="이름을 입력하세요"
          />

          <div className="form-group">
            <label htmlFor="edit-memo">메모 (선택)</label>
            <textarea id="edit-memo" name="memo" value={form.memo} onChange={handleChange} rows={3} />
          </div>

          {message && <div className={`message ${message.type}`}>{message.text}</div>}

          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
