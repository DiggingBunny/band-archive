import { extractYoutubeId } from '../lib/api';
import CommentSection from './CommentSection';

export default function VideoCard({ video, onDelete }) {
  const videoId = video.youtube_id || extractYoutubeId(video.youtube_url);

  return (
    <div className="video-card">
      <div className="video-thumbnail-wrapper">
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.song_name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">
            영상 보기 (외부 링크)
          </a>
        )}
      </div>
      <div className="video-info">
        <h3 className="video-song">
          {video.artist && `${video.artist} - `}{video.song_name}
          {video.take && <span className="video-take">#{video.take}</span>}
        </h3>
        <span className="video-date">{video.date}</span>
        {video.uploaded_by && <span className="video-uploader">by {video.uploaded_by}</span>}
        {video.memo && <p className="video-memo">{video.memo}</p>}
        {onDelete && (
          <button className="btn-delete" onClick={() => onDelete(video.id)}>
            삭제
          </button>
        )}
      </div>
      <CommentSection videoId={video.id} />
    </div>
  );
}
