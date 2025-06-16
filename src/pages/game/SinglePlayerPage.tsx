import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import GameLayout from './GameLayout';
import StartScreen from '../../components/StartScreen';

const SinglePlayerPage = () => {
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
        isMultiplayer={false}
      />
    );
  }

  return (
    <GameLayout isMultiplayer={false} onGoHome={handleGoHome}>
      {/* Game UI components specific to single player */}
    </GameLayout>
  );
};

export default SinglePlayerPage;
