import { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '../lib/api';

export default function CommentSection({ videoId, autoExpand, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(autoExpand || false);

  useEffect(() => {
    if (expanded) {
      loadComments();
    }
  }, [expanded, videoId]);

  async function loadComments() {
    try {
      const data = await getComments(videoId);
      setComments(data);
      if (onCountChange) onCountChange(data.length);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await addComment({ videoId, author: author.trim(), content: content.trim() });
      const updated = [...comments, newComment];
      setComments(updated);
      setContent('');
      if (onCountChange) onCountChange(updated.length);
    } catch (err) {
      alert('댓글 등록 실패: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteComment(id);
      const updated = comments.filter(c => c.id !== id);
      setComments(updated);
      if (onCountChange) onCountChange(updated.length);
    } catch (err) {
      alert('삭제 실패: ' + err.message);
    }
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${mins}`;
  }

  return (
    <div className="comment-section">
      <button className="comment-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? '댓글 접기 ▲' : `댓글 보기 ▼`}
      </button>

      {expanded && (
        <div className="comment-body">
          {comments.length === 0 ? (
            <p className="comment-empty">아직 댓글이 없습니다.</p>
          ) : (
            <div className="comment-list">
              {comments.map(c => (
                <div key={c.id} className="comment-item">
                  <span className="comment-author">{c.author}</span>
                  <span className="comment-time">{formatTime(c.created_at)}</span>
                  <span className="comment-content">{c.content}</span>
                  <button className="comment-delete" onClick={() => handleDelete(c.id)}>×</button>
                </div>
              ))}
            </div>
          )}

          <form className="comment-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="이름"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="comment-input comment-author-input"
              required
            />
            <div className="comment-input-row">
              <input
                type="text"
                placeholder="댓글을 입력하세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="comment-input comment-content-input"
                required
              />
              <button type="submit" className="comment-submit" disabled={submitting}>
                {submitting ? '...' : '등록'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
