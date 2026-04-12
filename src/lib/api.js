import { supabase } from './supabase';

// 영상 등록
export async function addVideo({ date, songName, youtubeUrl, memo }) {
  const videoId = extractYoutubeId(youtubeUrl);
  const { data, error } = await supabase
    .from('videos')
    .insert([{ date, song_name: songName, youtube_url: youtubeUrl, youtube_id: videoId, memo }])
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
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

// 일자별 조회
export async function getVideosByDate(date) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('date', date)
    .order('song_name', { ascending: true });
  if (error) throw error;
  return data;
}

// 고유 곡명 목록
export async function getSongList() {
  const { data, error } = await supabase
    .from('videos')
    .select('song_name')
    .order('song_name');
  if (error) throw error;
  const unique = [...new Set(data.map(d => d.song_name))];
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
