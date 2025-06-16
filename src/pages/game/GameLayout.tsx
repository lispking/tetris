import type { ReactNode } from 'react';
import Game from '../../components/Game';

interface GameLayoutProps {
  children?: ReactNode;
  isMultiplayer?: boolean;
  onGoHome: () => void;
}

const GameLayout = ({ children, isMultiplayer = false, onGoHome }: GameLayoutProps) => {
  return (
    <div className="game-layout">
      <Game onGoHome={onGoHome} isMultiplayer={isMultiplayer} />
      {children}
    </div>
  );
};

export default GameLayout;
