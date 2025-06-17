import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load pages for better performance
const Home = lazy(() => import('../pages/Home'));
const SinglePlayerPage = lazy(() => import('../pages/game/SinglePlayerPage'));
const MultiplayerPage = lazy(() => import('../pages/game/MultiplayerPage'));
const LeaderboardPage = lazy(() => import('../pages/LeaderboardPage'));
const NFTMinter = lazy(() => import('../components/NFTMinter'));

const AppRouter = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/singleplayer"
          element={
            <SinglePlayerPage />
          }
        />
        <Route
          path="/multiplayer"
          element={
            <ProtectedRoute>
              <MultiplayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nfts"
          element={
            <ProtectedRoute>
              <NFTMinter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <LeaderboardPage />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
