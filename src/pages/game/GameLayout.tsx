import type { ReactNode } from 'react';
import Game from '../../components/Game';

interface GameLayoutProps {
  children?: ReactNode;
  onGoHome: () => void;
}

const GameLayout = ({ children, onGoHome }: GameLayoutProps) => {
  return (
    <div className="game-layout">
      <Game onGoHome={onGoHome} />
      {children}
    </div>
  );
};

export default GameLayout;
