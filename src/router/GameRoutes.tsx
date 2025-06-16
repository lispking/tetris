import { useSearchParams } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Game from '../components/Game';
import StartScreen from '../components/StartScreen';

interface GameRoutesProps {
  isMultiplayer?: boolean;
}

const GameRoutes: React.FC<GameRoutesProps> = ({ isMultiplayer = false }) => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || '';
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = useCallback(() => {
    setGameStarted(true);
  }, []);

  const handleGoHome = useCallback(() => {
    setGameStarted(false);
  }, []);

  if (gameStarted) {
    return (
      <Game
        onGoHome={handleGoHome}
        isMultiplayer={isMultiplayer}
      />
    );
  }

  return (
    <StartScreen
      onStart={handleStartGame}
      isMultiplayer={isMultiplayer}
      initialRoomId={roomId}
    />
  );
};

export default GameRoutes;
