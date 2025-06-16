import React, { useState, useEffect, useCallback } from 'react';
import { getPlayerName, setPlayerName } from '../utils/storage';
import MultiplayerSession from './MultiplayerSession';
import styles from './MultiplayerLobby.module.css';
import { useAccount } from 'wagmi';
import { useNftData } from '../hooks/useNftData';
import { Link } from 'react-router-dom';

interface MultiplayerLobbyProps {
    initialRoomId?: string;
    onBack?: () => void;
}

// Inner component that handles the actual lobby UI
const LobbyUI: React.FC<{
    roomId: string;
    setRoomId: (id: string) => void;
    username: string;
    setUsername: (name: string) => void;
    isInRoom: boolean;
    setIsInRoom: (inRoom: boolean) => void;
    error: string;
    setError: (error: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    onBack: () => void;
}> = ({
    roomId,
    setRoomId,
    username,
    setUsername,
    isInRoom,
    setIsInRoom,
    error,
    setError,
    isLoading,
    setIsLoading,
    onBack
}) => {
    const handleEnterRoom = useCallback((targetUsername: string, targetRoomId?: string) => {
        const effectiveRoomId = (targetRoomId || roomId)?.toString().trim();
        if (!effectiveRoomId) {
            setError('Room ID is missing');
            return;
        }
        setRoomId(effectiveRoomId);
        console.log(`[${targetUsername}] Entering room ${effectiveRoomId}`);
        setIsInRoom(true);
        setError('');
        setIsLoading(false);
        setPlayerName(targetUsername);
    }, [roomId, setRoomId, setIsInRoom, setError, setIsLoading]);

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
        const newRoomId = Math.random().toString(36).substring(2, 8);
        console.log(`[${username}] Creating new room: ${newRoomId}`);
        setRoomId(newRoomId);
        setIsInRoom(true);
        setIsLoading(false);
        setPlayerName(username);
    }, [username, setRoomId, setIsInRoom, setIsLoading, setError]);

    if (isInRoom) {
        return (
            <div className={styles.roomWrapper}>
                <MultiplayerSession
                    roomId={roomId}
                    playerName={username}
                    onLeave={onBack}
                />
            </div>
        );
    }

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
                            onChange={(e) => setUsername(e.target.value)}
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
                            onChange={(e) => setRoomId(e.target.value)}
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
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main component that handles NFT check and loading states
const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ initialRoomId = '', onBack = () => {} }) => {
    // State for the lobby
    const [roomId, setRoomId] = useState(initialRoomId);
    const [username, setUsername] = useState('');
    const [isInRoom, setIsInRoom] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Wallet connection and NFT data
    const { address } = useAccount();
    const { ownedNft, isLoading: isNftLoading } = useNftData(address);

    // Load player name on mount
    useEffect(() => {
        const loadPlayerName = async () => {
            try {
                const savedName = await getPlayerName();
                if (savedName) {
                    setUsername(savedName);
                }
            } catch (error) {
                console.error('Failed to load player name:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadPlayerName();
    }, []);
    
    // Update room ID if initialRoomId changes
    useEffect(() => {
        if (initialRoomId) {
            setRoomId(initialRoomId);
        }
    }, [initialRoomId]);

    // Show loading state while checking NFT status or loading data
    if (isLoading || isNftLoading || !address) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading multiplayer lobby...</p>
            </div>
        );
    }
    
    // Show NFT required message if user doesn't own an NFT
    if (!ownedNft) {
        return (
            <div className={styles.noNftContainer}>
                <h2>NFT Required</h2>
                <p>You need to own a Tetris NFT to access multiplayer mode.</p>
                <Link to="/nfts" className={styles.mintButton}>
                    Get Your NFT
                </Link>
            </div>
        );
    }
    
    return (
        <LobbyUI
            roomId={roomId}
            setRoomId={setRoomId}
            username={username}
            setUsername={setUsername}
            isInRoom={isInRoom}
            setIsInRoom={setIsInRoom}
            error={error}
            setError={setError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            onBack={onBack}
        />
    );
};

export default MultiplayerLobby;