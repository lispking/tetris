import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import './App.css';

const GameRoutes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || '';
  const [gameStarted, setGameStarted] = useState(false);
  
  const handleStartGame = useCallback(() => {
    setGameStarted(true);
  }, []);

  const handleGoHome = useCallback(() => {
    setGameStarted(false);
  }, []);
  
  // Reset game state when returning home
  useEffect(() => {
    return () => {
      if (!gameStarted) {
        // Any cleanup needed when going back to start screen
      }
    };
  }, [gameStarted]);

  if (gameStarted) {
    return <Game onGoHome={handleGoHome} />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <StartScreen 
            onStart={handleStartGame} 
            initialRoomId={roomId} 
          />
        } 
      />
      <Route 
        path="/multiplayer" 
        element={
          <StartScreen 
            onStart={handleStartGame} 
            initialRoomId={roomId} 
          />
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <GameRoutes />
      </div>
    </Router>
  );
};

export default App;
