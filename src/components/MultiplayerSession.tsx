import React, { useEffect, useState } from 'react';
import { ReactTogether } from 'react-together';
import MultiplayerRoom from './MultiplayerRoom';

interface MultiplayerSessionProps {
    roomId: string;
    playerName: string;
    onLeave: () => void;
}

const MultiplayerSession: React.FC<MultiplayerSessionProps> = ({
    roomId,
    playerName,
    onLeave
}) => {
    const [sessionInitialized, setSessionInitialized] = useState(false);
    const sessionId = `tetris-room-${roomId.toLowerCase()}`;

    // Add a small delay to ensure the session is properly initialized
    useEffect(() => {
        console.log(`[${playerName}] Initializing session for room:`, roomId);
        const timer = setTimeout(() => {
            setSessionInitialized(true);
            console.log(`[${playerName}] Session initialized`);
        }, 300);

        return () => {
            clearTimeout(timer);
            console.log(`[${playerName}] Cleaning up session`);
        };
    }, [roomId, playerName]);

    if (!sessionInitialized) {
        return <div>Initializing multiplayer session...</div>;
    }

    return (
        <div className="multiplayer-session">
            <ReactTogether
                key={sessionId}
                sessionParams={{
                    appId: import.meta.env.VITE_APP_ID,
                    apiKey: import.meta.env.VITE_API_KEY,
                    name: sessionId,
                    password: 'TetrisGame1234',
                }}
                sessionIgnoresUrl={true}
            >
                <MultiplayerRoom
                    roomId={roomId}
                    playerName={playerName}
                    onLeave={onLeave}
                />
            </ReactTogether>
        </div>
    );
};

export default MultiplayerSession;
