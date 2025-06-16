import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          Play Tetris PvP on the Blockchain
        </h1>
        <p className={styles.subtitle}>
          Compete with players worldwide, earn rewards, and collect unique Tetris NFTs
        </p>
        <div className={styles.ctaContainer}>
          <Link to="/singleplayer" className={styles.primaryButton}>
            Play Now
          </Link>
          <Link to="/nfts" className={styles.secondaryButton}>
            View NFTs
          </Link>
        </div>
      </div>
      <div className={styles.heroImage}>
        <div className={styles.gamePreview}>
          <img src="./home.png" alt="" />
        </div>
      </div>
    </div>
  );
};

export default Home;
