import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import './App.css';

const AppRoutes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room') || '';
  const [gameStarted, setGameStarted] = useState(false);
  
  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (gameStarted) {
    return (
      <Game />
    );
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
        <AppRoutes />
      </div>
    </Router>
  );
};

export default App;
