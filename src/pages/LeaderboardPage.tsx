import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/leaderboardService';
import { useAccount } from 'wagmi';
import styles from './LeaderboardPage.module.css';

interface LeaderboardEntry {
  id: string;
  wallet_address: string;
  player_name: string;
  room_id: string;
  score: number;
  level: number;
  lines: number;
  game_duration: number;
  created_at: string;
}

const formatDuration = (seconds: number): string => {
  if (seconds === undefined || seconds === null) return 'N/A';
  if (seconds === 0) return '0';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  return `${remainingSeconds}s`;
};

const LeaderboardPage: React.FC = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address: currentUserAddress } = useAccount();
  const navigate = useNavigate();

  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard(100);
        setScores(data || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🏆 PVP Leaderboard</h1>
        <button 
          onClick={() => navigate('/')} 
          className={styles.backButton}
          aria-label="Back to home"
        >
          ← Back to Home
        </button>
      </header>
      
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} aria-hidden="true"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.error}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className={styles.leaderboard}>
          <div className={styles.tableHeader} role="row">
            <div className={`${styles.cell} ${styles.rankCell}`}>Rank</div>
            <div className={`${styles.cell} ${styles.playerCell}`}>Player</div>
            <div className={`${styles.cell} ${styles.walletCell}`}>Wallet</div>
            <div className={`${styles.cell} ${styles.roomCell}`}>Room ID</div>
            <div className={`${styles.cell} ${styles.scoreCell}`}>Score</div>
            <div className={`${styles.cell} ${styles.levelCell}`}>Level</div>
            <div className={`${styles.cell} ${styles.linesCell}`}>Lines</div>
            <div className={`${styles.cell} ${styles.durationCell}`}>Duration</div>
            <div className={`${styles.cell} ${styles.dateCell}`}>Date</div>
          </div>
          
          <div className={styles.leaderboardBody} role="grid">
            {scores.length > 0 ? (
              scores.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`${styles.entry} ${
                    entry.wallet_address?.toLowerCase() === currentUserAddress?.toLowerCase() 
                      ? styles.currentUser 
                      : ''
                  }`}
                  role="row"
                >
                  <div className={`${styles.cell} ${styles.rankCell}`} data-label="Rank">
                    <span className={styles.cellContent}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                    </span>
                  </div>
                  <div className={`${styles.cell} ${styles.playerCell}`} data-label="Player">
                    <span className={`${styles.cellContent} ${styles.playerName}`}>
                      {entry.player_name || 'Anonymous'}
                    </span>
                  </div>
                  <div className={`${styles.cell} ${styles.walletCell}`} data-label="Wallet">
                    <span className={`${styles.cellContent} ${styles.walletAddress}`}>
                      {formatWalletAddress(entry.wallet_address || '')}
                      {entry.wallet_address?.toLowerCase() === currentUserAddress?.toLowerCase() && (
                        <span className={styles.youBadge}>You</span>
                      )}
                    </span>
                  </div>
                  <div className={`${styles.cell} ${styles.roomCell}`} data-label="Room">
                    <span className={styles.cellContent}>
                      {entry.room_id}
                    </span>
                  </div>
                  <div className={`${styles.cell} ${styles.scoreCell}`} data-label="Score">
                    <span className={styles.cellContent}>
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                  <div className={`${styles.cell} ${styles.levelCell}`} data-label="Level">
                    <span className={styles.cellContent}>
                      {entry.level}
                    </span>
                  </div>
                  <div className={`${styles.cell} ${styles.linesCell}`} data-label="Lines">
                    <span className={styles.cellContent}>
                      {entry.lines}
                    </span>
                  </div>
                  <div className={`${styles.cell} ${styles.durationCell}`} data-label="Duration">
                    <span className={styles.cellContent}>
                      {formatDuration(entry.game_duration)}
                    </span>
                  </div>
                  <div className={`${styles.cell} ${styles.dateCell}`} data-label="Date">
                    <span className={styles.cellContent}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>
                <p>No leaderboard entries found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
