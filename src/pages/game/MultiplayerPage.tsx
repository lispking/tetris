import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import GameLayout from './GameLayout';
import StartScreen from '../../components/StartScreen';

const MultiplayerPage = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || '';
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!gameStarted) {
    return (
      <StartScreen
        onStart={handleStartGame}
        isMultiplayer={true}
        initialRoomId={roomId}
      />
    );
  }

  return (
    <GameLayout onGoHome={handleGoHome}>
      {/* Game UI components specific to multiplayer */}
    </GameLayout>
  );
};

export default MultiplayerPage;
