import React, { useState, useEffect, useCallback } from 'react';
import { useLeaveSession, useStateTogether } from 'react-together';
import styles from './MultiplayerRoom.module.css';

interface Player {
    id: string;
    name: string;
    isReady: boolean;
    score?: number;
    level?: number;
    lines?: number;
}

interface MultiplayerRoomProps {
    roomId: string;
    playerName: string;
    onStartGame: () => void;
    onLeave: () => void;
}

const MultiplayerRoom: React.FC<MultiplayerRoomProps> = ({
    roomId,
    playerName,
    onStartGame,
    onLeave,
}) => {
    const [players, setPlayers] = useStateTogether<Player[]>('players', []);
    const [isReady, setIsReady] = useStateTogether<boolean>(`${playerName}-ready`, false);
    const [gameStarted, setGameStarted] = useStateTogether<boolean>('gameStarted', false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const leaveSession = useLeaveSession()

    const copyRoomUrl = () => {
        const url = `${window.location.origin}/multiplayer?room=${encodeURIComponent(roomId)}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy URL: ', err);
                setError('Failed to copy room URL');
            });
    };

    // Ensure players is always an array
    const safePlayers = Array.isArray(players) ? players : [];

    // Initialize player in the room
    useEffect(() => {
        if (!playerName) return;

        let isMounted = true;
        
        const addPlayer = async () => {
            try {
                // Only add player if they don't exist in the players list
                await setPlayers(prevPlayers => {
                    if (!isMounted) return prevPlayers || [];
                    
                    const currentPlayers = Array.isArray(prevPlayers) ? prevPlayers : [];
                    const playerExists = currentPlayers.some(p => p.id === playerName);
                    
                    if (playerExists) {
                        return currentPlayers;
                    }
                    
                    return [...currentPlayers, { 
                        id: playerName, 
                        name: playerName, 
                        isReady: false 
                    }];
                });
            } catch (error) {
                console.error('Error adding player:', error);
            }
        };
        
        addPlayer();
        
        return () => {
            isMounted = false;
        };

        // Cleanup on unmount
        return () => {
            setPlayers(prevPlayers => {
                if (!Array.isArray(prevPlayers)) return [];
                return prevPlayers.filter(p => p.id !== playerName);
            });
        };
    }, [playerName, setPlayers]);

    const toggleReady = () => {
        const newReadyState = !isReady;
        // Update both the individual ready state and the players list
        setIsReady(newReadyState);

        // Update the player's ready status in the players list
        setPlayers(prevPlayers => {
            if (!prevPlayers) return [];
            return prevPlayers.map(p =>
                p.id === playerName ? { ...p, isReady: newReadyState } : p
            );
        });
    };

    // Sync the player's ready state with the players list
    useEffect(() => {
        if (!playerName || !Array.isArray(players)) return;

        const currentPlayer = players.find(p => p.id === playerName);
        if (currentPlayer && currentPlayer.isReady !== isReady) {
            setPlayers(prevPlayers => {
                if (!Array.isArray(prevPlayers)) return [];
                return prevPlayers.map(p => 
                    p.id === playerName ? { ...p, isReady } : p
                );
            });
        }
    }, [isReady, playerName, players, setPlayers]);

    const handleStartGame = useCallback(() => {
        if (!Array.isArray(players) || players.length === 0) {
            setError('No players in the room');
            return;
        }
        
        const allReady = players.length >= 2 && players.every(p => p.isReady);
        if (allReady) {
            setGameStarted(true);
            onStartGame();
        } else {
            setError(players.length < 2 ? 
                'At least 2 players are needed to start' : 
                'All players must be ready to start');
        }
    }, [players, onStartGame]);

    const handleLeaveRoom = useCallback(() => {
        // First update local state to prevent UI flicker
        setError('');
        
        // Then clean up the session
        leaveSession();
        
        // Finally, call the parent's onLeave handler
        onLeave();
    }, [leaveSession, onLeave]);

    // If game has started, the parent component will handle the transition
    if (gameStarted) return null;

    return (
        <div className={styles.roomContainer}>
            <div className={styles.roomHeader}>
                <div className={styles.roomTitle}>
                    <h2>Room: {roomId}</h2>
                    <button 
                        onClick={copyRoomUrl} 
                        className={styles.copyButton}
                        title="Copy room URL to clipboard"
                    >
                        {copySuccess ? '✓ Copied!' : '📋'}
                    </button>
                </div>
                <button onClick={handleLeaveRoom} className={styles.leaveButton}>
                    Leave Room
                </button>
            </div>

            <div className={styles.playersList}>
                <h3>Players ({safePlayers.length}/2)</h3>
                {safePlayers.map(player => (
                    <div key={player.id} className={styles.playerItem}>
                        <span>{player.name} {player.id === playerName && '(You)'}</span>
                        <span className={player.isReady ? styles.ready : styles.notReady}>
                            {player.isReady ? 'Ready' : 'Not Ready'}
                        </span>
                    </div>
                ))}
            </div>

            <div className={styles.roomActions}>
                <button
                    onClick={toggleReady}
                    className={`${styles.readyButton} ${isReady ? styles.ready : ''}`}
                >
                    {isReady ? 'Not Ready' : 'Ready'}
                </button>

                {safePlayers[0]?.id === playerName && (
                    <button
                        onClick={handleStartGame}
                        className={styles.startButton}
                        disabled={!safePlayers.every(p => p.isReady) || safePlayers.length < 2}
                    >
                        Start Game
                    </button>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default MultiplayerRoom;
