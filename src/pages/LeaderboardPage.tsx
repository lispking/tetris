import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/leaderboardService';
import { useAccount } from 'wagmi';
import styles from './LeaderboardPage.module.css';

const LeaderboardPage: React.FC = () => {
  const [scores, setScores] = useState<any[]>([]);
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
      <div className={styles.header}>
        <h1>🏆 Leaderboard</h1>
        <button 
          onClick={() => navigate('/')} 
          className={styles.backButton}
        >
          ← Back to Home
        </button>
      </div>
      
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
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
          <div className={styles.tableHeader}>
            <div className={styles.rankHeader}>Rank</div>
            <div className={styles.playerHeader}>Player</div>
            <div className={styles.walletHeader}>Wallet</div>
            <div className={styles.roomHeader}>Room ID</div>
            <div className={styles.scoreHeader}>Score</div>
            <div className={styles.levelHeader}>Level</div>
            <div className={styles.linesHeader}>Lines</div>
            <div className={styles.dateHeader}>Date</div>
          </div>
          <div className={styles.leaderboardBody}>
            {scores.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`${styles.entry} ${
                  entry.wallet_address?.toLowerCase() === currentUserAddress?.toLowerCase() ? styles.currentUser : ''
                }`}
              >
                <div className={styles.cell} data-label="Rank">
                  <div className={styles.rank}>
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                  </div>
                </div>
                <div className={`${styles.cell} ${styles.playerCell}`} data-label="Player">
                  <div className={styles.playerName}>
                    {entry.player_name || 'Anonymous'}
                  </div>
                </div>
                <div className={`${styles.cell} ${styles.walletCell}`} data-label="Wallet">
                  <div className={styles.walletAddress}>
                    {formatWalletAddress(entry.wallet_address || '')}
                    {entry.wallet_address?.toLowerCase() === currentUserAddress?.toLowerCase() && (
                      <span className={styles.youBadge}>You</span>
                    )}
                  </div>
                </div>
                <div className={`${styles.cell} ${styles.roomCell}`} data-label="Room">
                  {entry.room_id}
                </div>
                <div className={`${styles.cell} ${styles.scoreCell}`} data-label="Score">
                  {entry.score.toLocaleString()}
                </div>
                <div className={`${styles.cell} ${styles.levelCell}`} data-label="Level">
                  {entry.level}
                </div>
                <div className={`${styles.cell} ${styles.linesCell}`} data-label="Lines">
                  {entry.lines}
                </div>
                <div className={`${styles.cell} ${styles.dateCell}`} data-label="Date">
                  {new Date(entry.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
