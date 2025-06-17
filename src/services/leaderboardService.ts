import { saveGameResult, type LeaderboardEntry } from '../utils/supabase';
import { supabase } from '../utils/supabase';

export interface SavePlayerResultParams extends Omit<LeaderboardEntry, 'id' | 'created_at'> {}

export const savePlayerResult = async (playerData: SavePlayerResultParams) => {
  try {
    const result = await saveGameResult(playerData);
    return { 
      success: true, 
      data: result as LeaderboardEntry 
    };
  } catch (error) {
    console.error('Failed to save player result:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Failed to save player result') 
    };
  }
};

export const getLeaderboard = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

export const fetchLeaderboard = async (roomId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('room_id', roomId)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return { 
      success: true, 
      data: data as LeaderboardEntry[] 
    };
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Failed to fetch leaderboard') 
    };
  }
};

export interface PlayerResult {
  id: string;
  walletAddress: string;
  name: string;
  score: number;
  level: number;
  lines: number;
  gameDuration: number; // in seconds
  isYou: boolean;
}

export interface SaveMultiplayerResultsResponse {
  success: boolean;
  results: Array<{
    success: boolean;
    data?: LeaderboardEntry;
    error?: Error;
  }>;
}

export const saveMultiplayerResults = async (
  players: PlayerResult[], 
  roomId: string
): Promise<SaveMultiplayerResultsResponse> => {
  const results = await Promise.all(
    players.map(player => 
      savePlayerResult({
        player_id: player.id,
        player_name: player.name,
        wallet_address: player.walletAddress,
        score: player.score,
        level: player.level,
        lines: player.lines,
        game_duration: player.gameDuration,
        room_id: roomId
      })
    )
  );
  
  return {
    success: results.every(r => r.success),
    results
  };
};
