import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWalletClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Gift, CheckCircle, Loader2 } from 'lucide-react';
import styles from './NFTMinter.module.css';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { tetrisNFTContract } from '../utils/contractLoader';
import { useNftData } from '../hooks/useNftData';
import { useChainId } from 'wagmi';
import { monadTestnet } from 'viem/chains';

interface NFTMinterProps {
    onMintSuccess?: () => void;
}

const NFTMinter = ({ onMintSuccess }: NFTMinterProps) => {
    const navigate = useNavigate();

    const handleMintSuccess = () => {
        onMintSuccess?.();
        navigate('/multiplayer');
    };

    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const chainId = useChainId();
    const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);
    const [isMinting, setIsMinting] = useState(false);
    const [mintSuccess, setMintSuccess] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { nfts, nftInfo, ownedNft, refetch } = useNftData(address);

    const handleMint = async (tokenId: bigint) => {
        if (!address || !tokenId) return;

        const toastId = toast.loading('Processing...');
        setIsMinting(true);
        setSelectedTokenId(tokenId);

        try {
            const signer = await new ethers.BrowserProvider(walletClient!).getSigner();
            const contract = tetrisNFTContract(signer);
            console.log('chainId: ', await walletClient?.getChainId());
            const tx = await contract.mint(tokenId);

            await tx.wait();
            setMintSuccess(true);
            refetch();
            toast.success(`Successfully minted NFT!`);
        } catch (error: any) {
            console.error(`Failed to mint NFT:`, error);
            if (error.code === 'ACTION_REJECTED') {
                toast.error('Transaction was rejected by user.');
            } else {
                toast.error(`Failed to mint NFT: ${error.message}`);
            }
        } finally {
            setIsMinting(false);
            toast.dismiss(toastId);
        }
    };



    if (!isClient) {
        return null; // Avoid hydration mismatch
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* Main Content */}
                <main className="mt-12">
                    <AnimatePresence mode="wait">
                        {!isConnected ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.connectSection}
                            >
                                <Gift className={styles.connectIcon} />
                                <h2 className={styles.connectTitle}>Unlock Multiplayer Mode</h2>
                                <p className={styles.connectText}>
                                    Connect your wallet to mint a unique Tetris PvP NFT and start playing with friends!
                                </p>
                                <div className="flex justify-center">
                                    <ConnectButton
                                        label="Connect Wallet to Continue"
                                    />
                                </div>
                            </motion.div>
                        ) : nftInfo?.resourceId && nftInfo.resourceId > 0n && ownedNft ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={styles.nftOwnedContainer}
                            >
                                <div className={styles.nftCard}>
                                    <div className={styles.nftImageContainer}>
                                        <div className={styles.nftImage}>
                                            <div className={styles.nftId}><img src={`./nfts/${ownedNft.id}.png`} alt={ownedNft.name} height={300} /></div>
                                        </div>
                                        <div className={styles.nftRarity}>Rare</div>
                                    </div>
                                    <div className={styles.nftDetails}>
                                        <h2 className={styles.nftName}>{ownedNft.name}</h2>
                                        <p className={styles.nftDescription}>{ownedNft.description}</p>
                                        <div className={styles.nftOwner}>
                                            <span>Owned by you</span>
                                            <span className={styles.ownerAddress}>
                                                {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.nftActions}>
                                    <button
                                        onClick={handleMintSuccess}
                                        className={styles.actionButton}
                                    >
                                        Play with this NFT <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : mintSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.statusMessage} ${styles.successStatus}`}
                            >
                                <div className={styles.successIcon}>
                                    <CheckCircle className="w-10 h-10 text-blue-400" />
                                </div>
                                <h2 className={styles.successTitle}>Mint Successful!</h2>
                                <p className={styles.successText}>
                                    Your Tetris PvP NFT has been minted successfully. Welcome to the multiplayer experience!
                                </p>
                                <button
                                    onClick={handleMintSuccess}
                                    className={styles.actionButton}
                                >
                                    Start Playing <ArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.headerSection}
                            >
                                <h2 className={styles.headerTitle}>
                                    Choose Your Tetris Avatar
                                </h2>
                                <p className={styles.headerDescription}>
                                    Mint a unique Tetris PvP NFT to unlock multiplayer mode and special in-game features.
                                </p>
                                {chainId != monadTestnet.id && (
                                    <div className={styles.networkWarning}>
                                        <span>Please switch to Monad Testnet to mint</span>
                                    </div>
                                )}

                                <div className={styles.gridContainer}>
                                    <div className={styles.grid}>
                                        {nfts.map((nft) => {
                                            const isMintingThis = isMinting && selectedTokenId === BigInt(nft.id);
                                            return (
                                                <motion.div
                                                    key={nft.id}
                                                    whileHover={{
                                                        y: -4,
                                                        transition: { duration: 0.2, ease: 'easeOut' }
                                                    }}
                                                    className={styles.card}
                                                >
                                                    <div className={styles.cardImageContainer}>
                                                        <div className={styles.cardOverlay} />
                                                        <img
                                                            src={`/nfts/${nft.id}.png`}
                                                            alt={nft.name}
                                                            className={styles.cardImage}
                                                        />
                                                    </div>
                                                    <div className={styles.cardContent}>
                                                        <div>
                                                            <h3 className={styles.cardTitle}>
                                                                {nft.name}
                                                            </h3>
                                                            <p className={styles.cardDescription}>{nft.description}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleMint(BigInt(nft.id))}
                                                            disabled={isMinting}
                                                            className={`${styles.mintButton} ${isMintingThis ? styles.disabled : ''}`}
                                                        >
                                                            {isMintingThis ? (
                                                                <>
                                                                    <Loader2 className={styles.spinner} />
                                                                    <span>Minting...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>Mint Now</span>
                                                                    <ArrowRight className={styles.arrowIcon} />
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default NFTMinter;
