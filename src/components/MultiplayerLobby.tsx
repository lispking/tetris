import React, { useState, useEffect, useCallback } from 'react';
import styles from './MultiplayerLobby.module.css';
import { getPlayerName, setPlayerName } from '../utils/storage';
import MultiplayerRoom from './MultiplayerRoom';
import { ReactTogether } from 'react-together';

interface MultiplayerLobbyProps {
    onStartGame: (roomId: string, isHost: boolean, playerName: string) => void;
    onBack: () => void;
    initialRoomId?: string;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onStartGame, onBack, initialRoomId = '' }) => {
    const [roomId, setRoomId] = useState(initialRoomId);
    const [username, setUsername] = useState('');
    const [isInRoom, setIsInRoom] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userid, setUserId] = useState(username);

    // Initialize roomId from URL parameter if provided
    const [sessionId, setSessionId] = useState(Date.now().toString());
    
    useEffect(() => {
        if (initialRoomId) {
            setRoomId(initialRoomId);
        }
    }, [initialRoomId]);
    
    // Generate a new session ID and enter the room
    const handleEnterRoom = useCallback((newIsHost: boolean) => {
        // Update all states in a single batch to prevent multiple re-renders
        setSessionId(Date.now().toString());
        setIsInRoom(true);
        setIsHost(newIsHost);
        setError('');
        setIsLoading(false);
    }, []);

    // Load saved player name on component mount
    useEffect(() => {
        const loadPlayerName = async () => {
            try {
                const savedName = await getPlayerName();
                if (savedName) {
                    setUsername(savedName);
                }
            } catch (error) {
                console.error('Error loading player name:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPlayerName();
    }, []);

    const handleUsernameChange = useCallback(async (value: string) => {
        setUsername(value);
        // Save to storage on change
        if (value.trim()) {
            try {
                await setPlayerName(value.trim());
                setUserId(value.trim() + '-' + Math.random().toString(36).substring(2, 8));
            } catch (error) {
                console.error('Error saving player name:', error);
            }
        }
    }, []);

    const handleJoinRoom = async (e?: React.FormEvent) => {
        // Only prevent default if this was triggered by a form submission
        if (e) {
            e.preventDefault();
        }

        setError('');

        if (!roomId.trim()) {
            setError('Please enter a room ID');
            return false;
        }

        if (!username.trim()) {
            setError('Please enter your name');
            return false;
        }

        setIsLoading(true);
        try {
            // In a real app, you would validate the room exists on your server
            // For now, we'll simulate a successful join
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Enter the room as a guest
            handleEnterRoom(false);
            return true;
        } catch (err) {
            console.error('Failed to join room:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to join room. Please try again.';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        setError('');

        if (!username.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsLoading(true);
        try {
            // Generate a random room ID
            const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            setRoomId(newRoomId);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Enter the room as host
            handleEnterRoom(true);
        } catch (err) {
            console.error('Failed to create room:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create room. Please try again.';
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleLeaveRoom = useCallback(() => {
        // Reset the room state first
        const wasInRoom = isInRoom;
        
        // Immediately update local state to prevent UI flicker
        setIsInRoom(false);
        setIsHost(false);
        setError('');
        setIsLoading(false);
        
        // Only call onBack if we were actually in a room
        if (wasInRoom) {
            console.log(username, 'left room!');
            onBack();
        }
    }, [isInRoom, onBack, username]);

    const handleGameStart = useCallback(() => {
        onStartGame(roomId, isHost, username);
    }, [onStartGame, roomId, isHost, username]);

    if (isInRoom) {
        return (
            <ReactTogether
                key={sessionId} // Force remount with new session when sessionId changes
                userId={userid}
                sessionParams={{
                    appId: import.meta.env['VITE_APP_ID'],
                    apiKey: import.meta.env['VITE_API_KEY'],
                    name: `tetris-${roomId}`, // Use room ID in session name
                    password: 'TetrisGame1234',
                }}
            >
                <MultiplayerRoom
                    roomId={roomId}
                    playerName={username}
                    onStartGame={handleGameStart}
                    onLeave={handleLeaveRoom}
                />
            </ReactTogether>
        );
    }

    return (
        <div className={styles.lobbyContainer}>
            <button 
                onClick={onBack} 
                className={styles.backButton}
                disabled={isLoading}
            >
                ← Back
            </button>
            <div className={styles.lobbyContent}>
                <h2>Multiplayer Mode</h2>
                <div className={styles.usernameSection}>
                    <label htmlFor="username">Your Name:</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="Enter your name"
                        className={styles.inputField}
                        disabled={isLoading}
                        autoFocus={!initialRoomId}
                    />
                </div>

                <div className={styles.roomActions}>
                    <button
                        type="button"
                        onClick={handleCreateRoom}
                        className={`${styles.actionButton} ${styles.createButton}`}
                        disabled={!username.trim() || isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create New Room'}
                    </button>

                    {error && <div className={styles.errorMessage}>{error}</div>}
                    <div className={styles.divider}>
                        <span>OR</span>
                    </div>

                    <form onSubmit={handleJoinRoom} className={styles.joinForm}>
                        <div className={styles.roomInputGroup}>
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                onBlur={(e) => setRoomId(e.target.value.trim().toUpperCase())}
                                placeholder="Enter room ID"
                                className={styles.inputField}
                                disabled={isLoading}
                                autoFocus={!!initialRoomId}
                            />
                            <button
                                type="submit"
                                className={styles.joinButton}
                                disabled={!roomId.trim() || !username.trim() || isLoading}
                            >
                                {isLoading ? 'Joining...' : 'Join Room'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MultiplayerLobby;
