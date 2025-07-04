import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLeaveSession, useStateTogether } from 'react-together';
import { Slider, InputNumber } from 'antd';
import 'antd/dist/reset.css';
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
    const [gameStatus, setGameStatus] = useStateTogether<'waiting' | 'started'>('gameStatus', 'waiting');
    // Use a ref to track if we've initialized the game duration to prevent overwriting
    const initializedRef = useRef(false);
    const [gameDuration, setGameDuration] = useStateTogether<number>('gameDuration', 60); // Default 1 minute
    const [localGameDuration, setLocalGameDuration] = useState(60);
    
    // Sync local state with shared state
    useEffect(() => {
      setLocalGameDuration(gameDuration);
      initializedRef.current = true;
    }, [gameDuration]);
    
    // Check if current player is the host (first player in the players array)
    const isHost = players.length > 0 && players[0].name === playerName;
    
    // Update local duration when it changes from other players
    useEffect(() => {
      if (!isHost) {
        setLocalGameDuration(gameDuration);
      }
    }, [gameDuration, isHost]);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const leaveSession = useLeaveSession();

    // Start the game when all players are ready
    useEffect(() => {
        if (gameStatus === 'started') {
            console.log(playerName, 'Game started');
        }
    }, [gameStatus, playerName]);

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
        if (!playerName || !roomId) return;

        console.log(`[${playerName}] Initializing player in room:`, roomId);
        let isMounted = true;
        let retryCount = 0;
        const maxRetries = 3;

        const addPlayer = () => {
            if (!isMounted) return;

            setPlayers(prevPlayers => {
                if (!isMounted) return prevPlayers || [];

                const currentPlayers = Array.isArray(prevPlayers) ? [...prevPlayers] : [];
                const playerExists = currentPlayers.some(p => p.id === playerName);

                if (!playerExists) {
                    console.log(`[${playerName}] Adding new player to room ${roomId}`);
                    return [...currentPlayers, {
                        id: playerName,
                        name: playerName,
                        isReady: false
                    }];
                } else if (retryCount < maxRetries) {
                    // Retry adding player if not added yet
                    retryCount++;
                    console.log(`[${playerName}] Player exists, retry ${retryCount}/${maxRetries}`);
                    setTimeout(addPlayer, 500);
                }

                return currentPlayers;
            });
        };

        // Initial add player with retry mechanism
        const timer = setTimeout(() => {
            console.log(`[${playerName}] Starting player initialization`);
            addPlayer();
        }, 300); // Slightly longer initial delay

        // Cleanup on unmount
        return () => {
            isMounted = false;
            clearTimeout(timer);

            if (playerName) {
                console.log(`[${playerName}] Cleaning up player from room ${roomId}`);
                setPlayers(prevPlayers => {
                    if (!Array.isArray(prevPlayers)) return [];
                    const updatedPlayers = prevPlayers.filter(p => p.id !== playerName);
                    console.log(`[${playerName}] Remaining players:`, updatedPlayers.length);
                    return updatedPlayers;
                });
            }
        };
    }, [playerName, roomId, setPlayers]);

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
            console.log('All players are ready, starting the game...');
            setIsLoading(true);
            
            try {
                // Update game status to started
                await setGameStatus('started');
                console.log(playerName, 'Game started');
            } catch (err) {
                console.error('Failed to start game:', err);
                setError('Failed to start the game. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            const errorMsg = players.length < 2 ?
                'At least 2 players are needed to start' :
                'All players must be ready to start';
            console.log(playerName, 'Cannot start game:', errorMsg);
            setError(errorMsg);
        }
    }, [players, playerName, setGameStatus]);

    const handleLeaveRoom = useCallback(() => {
        // Then clean up the session
        leaveSession();

        // Finally, call the parent's onLeave handler
        onLeave();
    }, [leaveSession, onLeave]);

    // Show loading state
    if (isLoading) {
        return (
            <div className={styles.roomContainer}>
                <div className={styles.gameStarting}>
                    <h3>Starting Game...</h3>
                    <p>Preparing the game. Please wait.</p>
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
                gameDuration={gameDuration}
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
                <div className={styles.durationSetting}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        Game Duration: {Math.floor(localGameDuration / 60)} min {localGameDuration % 60 ? `${localGameDuration % 60} sec` : ''}
                    </label>
                    {isHost ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <Slider
                                    min={30}
                                    max={300}
                                    step={30}
                                    value={localGameDuration}
                                    onChange={(value) => {
                                        const newValue = value as number;
                                        setLocalGameDuration(newValue);
                                        setGameDuration(newValue);
                                    }}
                                    style={{ flex: 1, maxWidth: '300px' }}
                                    tooltip={{ 
                                        formatter: (value) => `${Math.floor(value! / 60)}:${(value! % 60).toString().padStart(2, '0')}`,
                                        color: '#4CAF50'
                                    }}
                                />
                                <InputNumber
                                    min={30}
                                    max={300}
                                    step={30}
                                    value={localGameDuration}
                                    onChange={(value) => {
                                        if (value) {
                                            const newValue = typeof value === 'number' ? value : parseInt(value);
                                            setLocalGameDuration(newValue);
                                            setGameDuration(newValue);
                                        }
                                    }}
                                    style={{ width: '100px' }}
                                    formatter={(value) => `${Math.floor(Number(value) / 60)}:${(Number(value) % 60).toString().padStart(2, '0')}`}
                                    parser={(value) => {
                                        if (!value) return 60;
                                        const [minutes, seconds = '0'] = value.split(':');
                                        return (parseInt(minutes) * 60) + (parseInt(seconds) || 0);
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: '4px', fontSize: '0.8em', color: '#666' }}>
                                Adjust the slider or enter time in MM:SS format
                            </div>
                        </>
                    ) : (
                        <div style={{
                            padding: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            color: '#fff',
                            textAlign: 'center',
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            letterSpacing: '1px'
                        }}>
                            {`${Math.floor(localGameDuration / 60)}:${(localGameDuration % 60).toString().padStart(2, '0')}`}
                            <div style={{ fontSize: '0.8em', color: '#aaa', marginTop: '4px' }}>
                                Game duration set by host
                            </div>
                        </div>
                    )}
                </div>
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
