import { supabase } from './supabase';

// 영상 등록
export async function addVideo({ date, artist, songName, take, youtubeUrl, memo }) {
  const videoId = extractYoutubeId(youtubeUrl);
  const { data, error } = await supabase
    .from('videos')
    .insert([{ date, artist, song_name: songName, take: take || null, youtube_url: youtubeUrl, youtube_id: videoId, memo }])
    .select();
  if (error) throw error;
  return data[0];
}

// 모든 영상 조회
export async function getAllVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

// 곡별 조회
export async function getVideosBySong(songName) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('song_name', songName)
    .order('date', { ascending: false })
    .order('take', { ascending: true });
  if (error) throw error;
  return data;
}

// 일자별 조회
export async function getVideosByDate(date) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('date', date)
    .order('song_name', { ascending: true })
    .order('take', { ascending: true });
  if (error) throw error;
  return data;
}

// 고유 곡명 목록 (가수명 포함)
export async function getSongList() {
  const { data, error } = await supabase
    .from('videos')
    .select('artist, song_name')
    .order('song_name');
  if (error) throw error;
  const unique = [...new Map(data.map(d => [`${d.artist}||${d.song_name}`, { artist: d.artist, songName: d.song_name }])).values()];
  return unique;
}

// 고유 일자 목록
export async function getDateList() {
  const { data, error } = await supabase
    .from('videos')
    .select('date')
    .order('date', { ascending: false });
  if (error) throw error;
  const unique = [...new Set(data.map(d => d.date))];
  return unique;
}

// 영상 삭제
export async function deleteVideo(id) {
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw error;
}

// 댓글 조회
export async function getComments(videoId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

// 댓글 작성
export async function addComment({ videoId, author, content }) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ video_id: videoId, author, content }])
    .select();
  if (error) throw error;
  return data[0];
}

// 댓글 삭제
export async function deleteComment(id) {
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
}

// YouTube URL에서 video ID 추출
export function extractYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
    /(?:youtube\.com\/shorts\/)([^?\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
