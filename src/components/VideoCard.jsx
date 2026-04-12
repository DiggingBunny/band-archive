import { useState, useEffect } from 'react';
import { extractYoutubeId, getComments } from '../lib/api';
import CommentSection from './CommentSection';
import EditModal from './EditModal';

export default function VideoCard({ video, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(null);
  const videoId = video.youtube_id || extractYoutubeId(video.youtube_url);
  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

  useEffect(() => {
    getComments(video.id).then(data => setCommentCount(data.length)).catch(() => {});
  }, [video.id]);

  function handleSaved(updated) {
    setEditing(false);
    if (onUpdate) onUpdate(updated);
  }

  function handleCommentsToggle() {
    setShowComments(!showComments);
  }

  return (
    <>
      <div className="video-row">
        <div className="video-row-thumb">
          {thumbUrl ? (
            <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
              <img src={thumbUrl} alt={video.song_name} />
            </a>
          ) : (
            <div className="video-row-thumb-placeholder">No Thumbnail</div>
          )}
        </div>
        <div className="video-row-info">
          <span className="video-row-song">
            {video.artist && `${video.artist} - `}{video.song_name}
            {video.take && <span className="video-take">#{video.take}</span>}
          </span>
        </div>
        <div className="video-row-date">{video.date}</div>
        <div className="video-row-uploader">{video.uploaded_by ? `by ${video.uploaded_by}` : ''}</div>
        <div className="video-row-actions">
          <button className="btn-edit" onClick={() => setEditing(true)}>수정</button>
          {onDelete && <button className="btn-delete" onClick={() => onDelete(video.id)}>삭제</button>}
          <button className="btn-comment-toggle" onClick={handleCommentsToggle}>
            댓글{commentCount > 0 ? ` (${commentCount})` : ''} {showComments ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {showComments && (
        <div className="video-row-comments">
          <CommentSection videoId={video.id} autoExpand onCountChange={setCommentCount} />
        </div>
      )}
      {editing && (
        <EditModal video={video} onClose={() => setEditing(false)} onSaved={handleSaved} />
      )}
    </>
  );
}
