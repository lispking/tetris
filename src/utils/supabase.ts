import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeaderboardEntry {
  id?: string;
  player_id: string;
  player_name: string;
  wallet_address: string;
  score: number;
  level: number;
  lines: number;
  room_id: string;
  created_at?: string;
}

export const saveGameResult = async (entry: Omit<LeaderboardEntry, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('leaderboard')
    .insert([entry])
    .select();
  
  if (error) {
    console.error('Error saving game result:', error);
    throw error;
  }
  return data?.[0];
};

export const getLeaderboard = async (roomId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('room_id', roomId)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
  return data;
};
