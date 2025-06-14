import React, { useState, useEffect, useCallback } from 'react';
import styles from './MultiplayerLobby.module.css';
import { ReactTogether } from 'react-together';
import { getPlayerName, setPlayerName } from '../utils/storage';

interface MultiplayerLobbyProps {
    onCreateRoom: (username: string) => void;
    onJoinRoom: (roomId: string, username: string) => void;
    onBack: () => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onCreateRoom, onJoinRoom, onBack }) => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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
            } catch (error) {
                console.error('Error saving player name:', error);
            }
        }
    }, []);

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!roomId.trim()) {
            setError('Please enter a room ID');
            return;
        }

        if (!username.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsConnecting(true);
        try {
            // Here you would typically validate the room and username with your server
            // For now, we'll just pass them through
            onJoinRoom(roomId.trim(), username.trim());
        } catch (err) {
            console.error('Failed to join room:', err);
            setError('Failed to join room. Please try again.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleCreateRoom = async () => {
        setError('');

        if (!username.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsConnecting(true);
        try {
            // Here you would typically create a room on your server
            // For now, we'll just call onCreateRoom with the username
            await onCreateRoom(username.trim());
        } catch (err) {
            console.error('Failed to create room:', err);
            setError('Failed to create room. Please try again.');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <ReactTogether
            sessionParams={{
                appId: import.meta.env['VITE_APP_ID'],
                apiKey: import.meta.env['VITE_API_KEY'],
                name: 'tetris-game',
                password: 'TetrisGame1234',
            }}
        >
            <div className={styles.lobbyContainer}>
                <button onClick={onBack} className={styles.backButton}>
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
                        />
                    </div>

                    <div className={styles.roomActions}>
                        <button
                            onClick={handleCreateRoom}
                            className={styles.actionButton}
                            disabled={!username.trim() || isConnecting || isLoading}
                        >
                            Create New Room
                        </button>

                        {error && <div className={styles.errorMessage}>{error}</div>}
                        <div className={styles.divider}>OR</div>

                        <form onSubmit={handleJoinRoom} className={styles.joinForm}>
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="Enter room ID"
                                className={styles.inputField}
                            />
                            <button
                                type="submit"
                                className={styles.actionButton}
                                disabled={isConnecting}
                            >
                                {isConnecting ? 'Joining...' : 'Join Room'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </ReactTogether>
    );
};

export default MultiplayerLobby;
