import { useState, useEffect } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, ArrowRight, Gift } from 'lucide-react';
import styles from './NFTMinter.module.css';
import { monadTestnet } from 'viem/chains';
import TetrisNFTContract from '../contracts/TetrisNFT.json';

// Contract ABI
const ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "hasMinted",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

const CONTRACT_ADDRESS = TetrisNFTContract.address.monadTestnet as `0x${string}`;
console.log(`CONTRACT_ADDRESS: ${CONTRACT_ADDRESS}`);

interface NFTMinterProps {
    onMintSuccess?: () => void;
}

const NFTMinter = ({ onMintSuccess }: NFTMinterProps) => {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null);
    const [isMinting, setIsMinting] = useState(false);
    const [mintSuccess, setMintSuccess] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const nfts = [
        { id: 1, name: 'Classic Block', description: 'The original Tetris experience' },
        { id: 2, name: 'Neon Glow', description: 'Vibrant colors for the night' },
        { id: 3, name: 'Pixel Art', description: 'Retro gaming vibes' },
        { id: 4, name: 'Cyberpunk', description: 'Future of Tetris' },
    ];

    // Check if user has already minted an NFT
    const { data: hasMinted, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'hasMinted',
        args: [address!],
        query: {
            enabled: !!address,
        }
    });

    const { writeContractAsync } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setIsMinting(false);
                setMintSuccess(true);
                refetch();
                onMintSuccess?.();
            },
            onError: (error) => {
                console.error('Minting error:', error);
                setIsMinting(false);
            },
        },
    });

    const handleMint = async (tokenId: bigint) => {
        if (!address || !tokenId) return;
        setIsMinting(true);
        setSelectedTokenId(tokenId);

        try {
            await writeContractAsync({
                address: CONTRACT_ADDRESS,
                abi: ABI,
                functionName: 'mint',
                args: [tokenId],
            });
        } catch (error) {
            console.error('Minting failed:', error);
            setIsMinting(false);
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
                        ) : hasMinted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`${styles.statusMessage} ${styles.successStatus}`}
                            >
                                <div className={styles.successIcon}>
                                    <CheckCircle className="w-10 h-10 text-green-400" />
                                </div>
                                <h2 className={styles.successTitle}>You're All Set!</h2>
                                <p className={styles.successText}>
                                    Your Tetris PvP NFT is ready. You can now access multiplayer mode and challenge other players!
                                </p>
                                <button
                                    onClick={() => onMintSuccess?.()}
                                    className={styles.actionButton}
                                >
                                    Start Playing <ArrowRight className="w-5 h-5" />
                                </button>
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
                                    onClick={() => onMintSuccess?.()}
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
