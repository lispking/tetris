import React, { useState, useEffect } from 'react';
import styles from './MultiplayerGameOver.module.css';
import { saveMultiplayerResults } from '../services/leaderboardService';

interface PlayerResult {
  id: string;
  name: string;
  walletAddress: string;
  score: number;
  level: number;
  lines: number;
  gameDuration: number;
  isYou: boolean;
}

interface MultiplayerGameOverProps {
  playerResults: PlayerResult[];
  roomId: string;
  onBackToLobby: () => void;
  saveError?: string | null;
  savingResults?: boolean;
  onRetrySave?: () => Promise<void>;
}

const MultiplayerGameOver: React.FC<MultiplayerGameOverProps> = ({
  playerResults,
  roomId,
  onBackToLobby,
}) => {
  const [scoresSaved, setScoresSaved] = useState(false);
  const [savingScores, setSavingScores] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Save scores to the leaderboard when component mounts
  useEffect(() => {
    const saveScores = async () => {
      if (scoresSaved || !playerResults?.length) return;
      
      try {
        setSavingScores(true);
        await saveMultiplayerResults(
          playerResults.map(p => ({
            id: p.id,
            name: p.name,
            walletAddress: p.walletAddress,
            score: p.score,
            level: p.level,
            lines: p.lines,
            gameDuration: p.gameDuration || 0,
            isYou: p.isYou || false
          })),
          roomId
        );

        setScoresSaved(true);
      } catch (error) {
        console.error('Error saving scores:', error);
        setSaveError('An error occurred while saving scores.');
      } finally {
        setSavingScores(false);
      }
    };

    saveScores();
  }, [playerResults, roomId, scoresSaved]);

  // Ensure we have player results
  if (!playerResults || playerResults.length === 0) {
    return (
      <div className={styles.overlay}>
        <div className={styles.gameOverContainer}>
          <h2 className={styles.title}>Game Over</h2>
          <p>No game results available</p>
          <button 
            onClick={onBackToLobby}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Sort players by score in descending order
  const sortedPlayers = [...playerResults].sort((a, b) => (b?.score || 0) - (a?.score || 0));
  const winner = sortedPlayers[0] || { isYou: false, name: 'No winner', score: 0 };
  const isTie = sortedPlayers.length > 1 && sortedPlayers[0]?.score === sortedPlayers[1]?.score;

  return (
    <div className={styles.overlay}>
      <div className={styles.gameOverContainer}>
        <h2 className={styles.title}>Game Over</h2>
        
        {saveError && <div className={styles.errorMessage}>{saveError}</div>}
        {savingScores && <div className={styles.savingMessage}>Saving results...</div>}
        
        {isTie ? (
          <div className={styles.resultMessage}>
            <p>It's a tie!</p>
            <p>Top score: {winner.score.toLocaleString()}</p>
          </div>
        ) : (
          <div className={styles.resultMessage}>
            <p>{winner.isYou ? 'You Win!' : `${winner.name} Wins!`}</p>
            <p>Score: {winner.score.toLocaleString()}</p>
          </div>
        )}

        <div className={styles.playersList}>
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className={`${styles.playerRow} ${player.isYou ? styles.you : ''}`}
            >
              <span className={styles.rank}>{index + 1}.</span>
              <span className={styles.name}>
                {player.name}
                {player.isYou && <span className={styles.youBadge}>(You)</span>}
              </span>
              <span className={styles.score}>{player.score.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className={styles.buttonGroup}>
          <button 
            onClick={onBackToLobby}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGameOver;
