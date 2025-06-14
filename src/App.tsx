import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import './App.css';

const AppRoutes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomId = searchParams.get('room') || '';
  const [gameStarted, setGameStarted] = useState(false);
  
  // State for multiplayer game
  const [multiplayerState, setMultiplayerState] = useState({
    isMultiplayer: false,
    roomId: '',
    isHost: false,
    playerName: ''
  });
  
  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleMultiplayerStart = (roomId: string, isHost: boolean, playerName: string) => {
    console.log(roomId, 'Starting multiplayer game for', playerName);
    setMultiplayerState({
      isMultiplayer: true,
      roomId,
      isHost,
      playerName
    });
    setGameStarted(true);
  };

  const handleLeaveRoom = () => {
    // Keep the roomId for navigating back to the multiplayer page
    const currentRoomId = multiplayerState.roomId;
    
    setMultiplayerState({
      isMultiplayer: false,
      roomId: currentRoomId, // Keep the roomId in state for potential reuse
      isHost: false,
      playerName: ''
    });
    setGameStarted(false);
    
    // Navigate to the multiplayer page with the current room ID
    if (currentRoomId) {
      navigate(`/multiplayer?room=${encodeURIComponent(currentRoomId)}`);
    } else {
      navigate('/multiplayer');
    }
  };

  if (gameStarted) {
    console.log('Game started for', multiplayerState.playerName);
    return (
      <Game 
        isMultiplayer={multiplayerState.isMultiplayer}
        roomId={multiplayerState.roomId}
        isHost={multiplayerState.isHost}
        playerName={multiplayerState.playerName}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <StartScreen 
            onStart={handleStartGame} 
            onMultiplayerStart={handleMultiplayerStart} 
            initialRoomId={roomId} 
          />
        } 
      />
      <Route 
        path="/multiplayer" 
        element={
          <StartScreen 
            onStart={handleStartGame} 
            onMultiplayerStart={handleMultiplayerStart} 
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
