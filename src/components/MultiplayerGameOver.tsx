import React from 'react';
import styles from './MultiplayerGameOver.module.css';

interface PlayerResult {
  id: string;
  name: string;
  score: number;
  isYou: boolean;
}

interface MultiplayerGameOverProps {
  playerResults: PlayerResult[];
  onBackToLobby: () => void;
}

const MultiplayerGameOver: React.FC<MultiplayerGameOverProps> = ({
  playerResults,
  onBackToLobby,
}) => {
  // Sort players by score in descending order
  const sortedPlayers = [...playerResults].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isTie = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score;

  return (
    <div className={styles.overlay}>
      <div className={styles.gameOverContainer}>
        <h2 className={styles.title}>Game Over</h2>
        
        {isTie ? (
          <div className={styles.resultMessage}>
            <p>It's a tie!</p>
            <p>Top score: {winner.score}</p>
          </div>
        ) : (
          <div className={styles.resultMessage}>
            <p>{winner.isYou ? 'You Win!' : `${winner.name} Wins!`}</p>
            <p>Score: {winner.score}</p>
          </div>
        )}

        <div className={styles.leaderboard}>
          <h3>Final Scores</h3>
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
                <span className={styles.score}>{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            onClick={onBackToLobby}
            className={`${styles.button} ${styles.secondaryButton}`}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGameOver;
