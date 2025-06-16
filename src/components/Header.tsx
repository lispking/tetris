import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={`${styles.logoContainer} ${styles.titleGlow}`}>
        <Link to="/" className={`${styles.logo} ${styles.titleGlow}`}>
          Tetris PvP
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>
          Home
        </Link>
        <div className={styles.dropdown}>
          <button className={styles.navLink}>
            Play <span className={styles.dropdownIcon}>▼</span>
          </button>
          <div className={styles.dropdownContent}>
            <Link to="/singleplayer" className={styles.dropdownLink}>
              Single Player
            </Link>
            <Link to="/multiplayer" className={styles.dropdownLink}>
              Multiplayer
            </Link>
          </div>
        </div>
        <Link to="/nfts" className={styles.navLink}>
          My NFTs
        </Link>
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
