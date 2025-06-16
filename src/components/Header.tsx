import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const location = useLocation();
  const isPlayActive = ['/singleplayer', '/multiplayer'].includes(location.pathname);

  return (
    <header className={styles.header}>
      <div className={`${styles.logoContainer} ${styles.titleGlow}`}>
        <NavLink to="/" className={`${styles.logo} ${styles.titleGlow}`}>
          Tetris PvP
        </NavLink>
      </div>
      <nav className={styles.nav}>
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          Home
        </NavLink>
        <div className={styles.dropdown}>
          <button 
            className={`${styles.navLink} ${isPlayActive ? styles.active : ''}`}
            onClick={(e) => e.preventDefault()}
          >
            Play <span className={styles.dropdownIcon}>▼</span>
          </button>
          <div className={styles.dropdownContent}>
            <NavLink 
              to="/singleplayer" 
              className={({ isActive }) => 
                isActive ? `${styles.dropdownLink} ${styles.activeDropdownLink}` : styles.dropdownLink
              }
            >
              Single Player
            </NavLink>
            <NavLink 
              to="/multiplayer" 
              className={({ isActive }) => 
                isActive ? `${styles.dropdownLink} ${styles.activeDropdownLink}` : styles.dropdownLink
              }
            >
              Multiplayer
            </NavLink>
          </div>
        </div>
        <NavLink 
          to="/nfts" 
          className={({ isActive }) => 
            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
          }
        >
          My NFTs
        </NavLink>
      </nav>
      <div className={styles.walletButton}>
        <ConnectButton
          showBalance={false}
          accountStatus="address"
          chainStatus="icon"
        />
      </div>
    </header>
  );
};

export default Header;
