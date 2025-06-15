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
    const leaveSession = useLeaveSession();

    // Handle game start countdown
    useEffect(() => {
        if (gameStatus !== 'starting') return;

        // Start countdown from 3
        let remaining = 3;
        setCountdown(remaining);

        const interval = setInterval(() => {
            remaining--;
            if (remaining >= 0) {
                setCountdown(remaining);
            }
            
            if (remaining < 0) {
                clearInterval(interval);
                console.log(playerName, 'Starting game after countdown');
                setGameStatus('started');
                setLocalGameStarting(false);
                setCountdown(null);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
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
