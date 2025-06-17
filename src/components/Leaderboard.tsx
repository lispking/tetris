import React, { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../services/leaderboardService';
import styles from './Leaderboard.module.css';

export interface LeaderboardEntry {
  id?: string;  // Make optional to match Supabase types
  player_id: string;
  player_name: string;
  wallet_address: string;
  score: number;
  level: number;
  lines: number;
  room_id: string;
  created_at?: string;  // Make optional to match Supabase types
}

interface LeaderboardProps {
  roomId: string;
  currentPlayerId?: string;
  onClose?: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ roomId, currentPlayerId, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const result = await fetchLeaderboard(roomId);
        if (result.success && result.data) {
          setLeaderboard(result.data);
        } else {
          setError('Failed to load leaderboard');
        }
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError('An error occurred while loading the leaderboard');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [roomId]);

  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleString() : 'N/A';
  };

  if (loading) {
    return (
      <div className={styles.leaderboardContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.leaderboardContainer}>
        <h2>Leaderboard</h2>
        <div className={styles.errorMessage}>
          <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {error}
        </div>
        {onClose && (
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.header}>
        <h2>Leaderboard</h2>
        {onClose && (
          <button onClick={onClose} className={styles.closeButton} aria-label="Close leaderboard">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      {leaderboard.length === 0 ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none">
            <path d="M9.172 14.828L12.001 12M14.83 14.828L12.001 12M12 12L9.172 9.172M12 12L14.83 9.172M21 12C21 16.971 16.971 21 12 21C7.029 21 3 16.971 3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>No records found</p>
          <p className={styles.emptySubtext}>Be the first to play and set a high score!</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <div className={styles.tableHeaderCell}>Rank</div>
            <div className={styles.tableHeaderCell}>Player</div>
            <div className={styles.tableHeaderCell}>Score</div>
            <div className={styles.tableHeaderCell}>Level</div>
            <div className={styles.tableHeaderCell}>Lines</div>
            <div className={styles.tableHeaderCell}>Date</div>
          </div>
          <div className={styles.tableBody}>
            {leaderboard.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`${styles.tableRow} ${entry.player_id === currentPlayerId ? styles.currentPlayer : ''}`}
                aria-label={`Rank ${index + 1}: ${entry.player_name} with ${entry.score} points`}
              >
                <div className={styles.tableCell} data-label="Rank">
                  <span className={styles.rankBadge} data-rank={index + 1}>
                    {index + 1}
                  </span>
                </div>
                <div className={`${styles.tableCell} ${styles.playerCell}`} data-label="Player">
                  <span className={styles.playerName}>
                    {entry.player_name}
                    {entry.player_id === currentPlayerId && (
                      <span className={styles.youBadge} aria-hidden="true">You</span>
                    )}
                  </span>
                </div>
                <div className={styles.tableCell} data-label="Score">
                  {entry.score.toLocaleString()}
                </div>
                <div className={styles.tableCell} data-label="Level">
                  {entry.level}
                </div>
                <div className={styles.tableCell} data-label="Lines">
                  {entry.lines}
                </div>
                <div className={styles.tableCell} data-label="Date">
                  {formatDate(entry.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
