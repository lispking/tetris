import React, { useState, useEffect, useCallback } from 'react';
import { getPlayerName, setPlayerName } from '../utils/storage';
import MultiplayerSession from './MultiplayerSession';
import styles from './MultiplayerLobby.module.css';

interface MultiplayerLobbyProps {
    initialRoomId?: string;
    onBack?: () => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ initialRoomId = '', onBack }) => {
    const handleBack = useCallback(() => {
        if (onBack) {
            onBack();
        }
    }, [onBack]);
    const [roomId, setRoomId] = useState(initialRoomId);
    const [username, setUsername] = useState('');
    const [isInRoom, setIsInRoom] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialRoomId) {
            setRoomId(initialRoomId);
        }
    }, [initialRoomId]);

    useEffect(() => {
        const loadPlayerName = async () => {
            try {
                const savedName = await getPlayerName();
                if (savedName) {
                    setUsername(savedName);
                }
            } catch (error) {
                console.error('Failed to load player name:', error);
            }
        };
        loadPlayerName();
    }, []);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoomId(e.target.value);
    };

    const handleEnterRoom = useCallback((targetUsername: string, targetRoomId?: string) => {
        const effectiveRoomId = (targetRoomId || roomId)?.toString().trim();
        if (!effectiveRoomId) {
            setError('Room ID is missing');
            return;
        }

        // Always update the room ID to ensure consistency
        setRoomId(effectiveRoomId);

        console.log(`[${targetUsername}] Entering room ${effectiveRoomId}`);
        
        // Update UI state
        setIsInRoom(true);
        setError('');
        setIsLoading(false);
        setPlayerName(targetUsername);
    }, [roomId]);

    const handleJoinRoom = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!username.trim()) {
            setError('Please enter your name');
            return false;
        }

        if (!roomId.trim()) {
            setError('Please enter a room ID');
            return false;
        }

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            handleEnterRoom(username, roomId.trim());
            return true;
        } catch (err) {
            console.error('Failed to join room:', err);
            setError('Failed to join room. Please try again.');
            setIsLoading(false);
            return false;
        }
    };

    const handleCreateRoom = useCallback(() => {
        if (!username.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsLoading(true);
        setError('');

        // Generate a new room ID
        const newRoomId = Math.random().toString(36).substring(2, 8);

        console.log(`[${username}] Creating new room: ${newRoomId}`);
        
        // Update room state
        setRoomId(newRoomId);
        setIsInRoom(true);
        setIsLoading(false);
        setPlayerName(username);
    }, [username]);

    const handleLeaveRoom = useCallback(() => {
        const wasInRoom = isInRoom;
        setIsInRoom(false);
        setError('');
        setIsLoading(false);

        if (wasInRoom) {
            console.log(`[${username}] left room!`);
            handleBack();
        }
    }, [isInRoom, handleBack, username, onBack]);

    if (!isInRoom) {
        return (
            <div className={styles.lobbyContainer}>
                <div className={styles.lobbyContent}>
                    <h2>Multiplayer Lobby</h2>
                    <form onSubmit={handleJoinRoom} className={styles.lobbyForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Your Name:</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={handleUsernameChange}
                                placeholder="Enter your name"
                                disabled={isLoading}
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="roomId">Room ID:</label>
                            <input
                                id="roomId"
                                type="text"
                                value={roomId}
                                onChange={handleRoomIdChange}
                                placeholder="Enter room ID or leave empty to create"
                                disabled={isLoading}
                                className={styles.inputField}
                            />
                        </div>
                        {error && <div className={styles.error}>{error}</div>}
                        <div className={styles.buttonGroup}>
                            <button
                                type="button"
                                onClick={handleCreateRoom}
                                disabled={isLoading}
                                className={styles.primaryButton}
                            >
                                {isLoading ? 'Creating...' : 'Create Room'}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !roomId.trim()}
                                className={styles.secondaryButton}
                            >
                                {isLoading ? 'Joining...' : 'Join Room'}
                            </button>
                            {/* <button className={styles.backButton} onClick={handleBack}>
                                Back to Menu
                            </button> */}
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.roomWrapper}>
            <MultiplayerSession
                roomId={roomId}
                playerName={username}
                onLeave={handleLeaveRoom}
            />
        </div>
    );
};

export default MultiplayerLobby;