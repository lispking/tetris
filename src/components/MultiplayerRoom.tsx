import React, { useState, useEffect, useCallback } from 'react';
import { useLeaveSession, useStateTogether } from 'react-together';
import styles from './MultiplayerRoom.module.css';
import MultiplayerGame from './MultiplayerGame';

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
    onLeave: () => void;
}

const MultiplayerRoom: React.FC<MultiplayerRoomProps> = ({
    roomId,
    playerName,
    onLeave,
}) => {
    const [players, setPlayers] = useStateTogether<Player[]>('players', []);
    const [isReady, setIsReady] = useStateTogether<boolean>(`${playerName}-ready`, false);
    const [gameStatus, setGameStatus] = useStateTogether<'waiting' | 'starting' | 'started'>('gameStatus', 'waiting');
    const isHost = players.length === 0; // First player is host
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [localGameStarting, setLocalGameStarting] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [startTimeout, setStartTimeout] = useState<NodeJS.Timeout | null>(null);
    const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
    const leaveSession = useLeaveSession();
    
    // Handle game start countdown and timeout
    useEffect(() => {
        if (gameStatus === 'starting') {
            // Start countdown from 3
            setCountdown(3);
            
            // Update countdown every second
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(interval);
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            setCountdownInterval(interval);
            
            // Set timeout to start the game after countdown
            const timer = setTimeout(() => {
                console.log(playerName, 'Starting game after countdown');
                setGameStatus('started');
                setLocalGameStarting(false);
                setCountdown(null);
            }, 3000); // 3 second countdown
            
            setStartTimeout(timer);
            
            return () => {
                if (interval) clearInterval(interval);
                if (timer) clearTimeout(timer);
            };
        }
    }, [gameStatus, playerName]);
    
    // Cleanup timeouts and intervals on unmount
    useEffect(() => {
        return () => {
            if (startTimeout) clearTimeout(startTimeout);
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [startTimeout, countdownInterval]);

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

        console.log('Player joining room:', playerName);
        let isMounted = true;
        
        // Add current player to the players list
        const addPlayer = () => {
            if (!isMounted) return;
            
            setPlayers(prevPlayers => {
                if (!isMounted) return prevPlayers || [];
                
                const currentPlayers = Array.isArray(prevPlayers) ? [...prevPlayers] : [];
                const playerExists = currentPlayers.some(p => p.id === playerName);
                
                if (!playerExists) {
                    console.log('Adding new player:', playerName);
                    return [...currentPlayers, { 
                        id: playerName, 
                        name: playerName, 
                        isReady: false 
                    }];
                }
                
                return currentPlayers;
            });
        };
        
        // Small delay to ensure session is ready
        const timer = setTimeout(addPlayer, 100);

        // Cleanup on unmount
        return () => {
            isMounted = false;
            clearTimeout(timer);
            
            if (playerName) {
                console.log('Player leaving room:', playerName);
                setPlayers(prevPlayers => {
                    if (!Array.isArray(prevPlayers)) return [];
                    return prevPlayers.filter(p => p.id !== playerName);
                });
            }
        };
    }, [playerName, setPlayers]);

    // Sync ready state with the shared players list
    useEffect(() => {
        if (!playerName || !Array.isArray(players)) return;
        
        setPlayers(prevPlayers => {
            if (!Array.isArray(prevPlayers)) return [];
            
            // Check if update is needed
            const playerIndex = prevPlayers.findIndex(p => p.id === playerName);
            if (playerIndex === -1 || prevPlayers[playerIndex]?.isReady === isReady) {
                return prevPlayers;
            }
            
            // Only update the specific player's ready state
            return prevPlayers.map(p => 
                p.id === playerName ? { ...p, isReady } : p
            );
        });
    }, [isReady, playerName, setPlayers]); // Removed players from deps to prevent loop

    const toggleReady = useCallback(() => {
        // Update local state first
        setIsReady(prevReady => {
            const newReadyState = !prevReady;
            console.log('Toggling ready state for', playerName, 'to', newReadyState);
            
            // Update the players list with the new ready state
            setPlayers(prevPlayers => {
                if (!Array.isArray(prevPlayers)) return [];
                return prevPlayers.map(p => 
                    p.id === playerName ? { ...p, isReady: newReadyState } : p
                );
            });
            
            return newReadyState;
        });
    }, [playerName]); // Removed isReady from deps since we use the updater form

    const handleStartGame = useCallback(async () => {
        if (!Array.isArray(players) || players.length === 0) {
            console.log('No players in the room');
            setError('No players in the room');
            return;
        }
        
        const allReady = players.length >= 2 && players.every(p => p.isReady);
        if (allReady) {
            console.log('All players are ready, preparing to start the game...');
            
            // Set local loading state for immediate UI feedback
            setLocalGameStarting(true);
            
            // Update shared game status to 'starting' and then to 'started' after delay
            await setGameStatus('starting');
            console.log(playerName, 'Game status set to: starting');
            
            // Wait for all players to receive the 'starting' state
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Then update to 'started' to begin the game
            await setGameStatus('started');
            console.log(playerName, 'Game status set to: started');
            
            // Clear local loading state in case it's still active
            setLocalGameStarting(false);
        } else {
            const errorMsg = players.length < 2 ? 
                'At least 2 players are needed to start' : 
                'All players must be ready to start';
            console.log(playerName, 'Cannot start game:', errorMsg);
            setError(errorMsg);
        }
    }, [players, playerName, setGameStatus]);

    const handleLeaveRoom = useCallback(() => {
        // First update local state to prevent UI flicker
        setError('');
        
        // Then clean up the session
        leaveSession();
        
        // Finally, call the parent's onLeave handler
        onLeave();
    }, [leaveSession, onLeave]);

    // Show game starting message
    if (localGameStarting || gameStatus === 'starting') {
        console.log(playerName, 'Game is starting... current status:', { localGameStarting, gameStatus });
        
        return (
            <div className={styles.roomContainer}>
                <div className={styles.gameStarting}>
                    <h3>Game is starting in...</h3>
                    {countdown !== null && (
                        <div className={styles.countdown}>
                            {countdown}
                        </div>
                    )}
                    <p>Get ready to play!</p>
                </div>
            </div>
        );
    }
    
    // If game has started, render the MultiplayerGame component
    if (gameStatus === 'started') {
        return (
            <MultiplayerGame 
                roomId={roomId}
                isHost={isHost}
                playerName={playerName}
                onLeave={handleLeaveRoom}
            />
        );
    }

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
