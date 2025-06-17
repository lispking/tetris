import React from 'react';
import { useReadContract } from 'wagmi';
import TetrisNFTContract from '../contracts/TetrisNFT.json';

type NftData = {
    id: number;
    name: string;
    description: string;
};

// Available NFTs (moved outside the hook to prevent recreation on every render)
const AVAILABLE_NFTS: NftData[] = [
    { id: 1, name: 'Classic Block', description: 'The original Tetris experience' },
    { id: 2, name: 'Neon Glow', description: 'Vibrant colors for the night' },
    { id: 3, name: 'Pixel Art', description: 'Retro gaming vibes' },
    { id: 4, name: 'Cyberpunk', description: 'Future of Tetris' },
];

export function useNftData(address?: `0x${string}` | undefined): {
    nfts: NftData[];
    nftInfo: { tokenId: bigint; resourceId: bigint } | null | undefined;
    ownedNft: NftData | null;
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<{ data: any; error: any }>;
} {
    // Track if we have a valid address to prevent unnecessary refetches
    const hasValidAddress = !!address && typeof address === 'string';
    
    // Fetch NFT info from the contract
    const { 
        data: nftInfo, 
        refetch, 
        isLoading, 
        isError 
    } = useReadContract({
        address: TetrisNFTContract.address.monadTestnet as `0x${string}`,
        abi: TetrisNFTContract.abi,
        functionName: 'hasMinted',
        args: [address!],
        query: {
            enabled: hasValidAddress,
            select: (data: any) => {
                if (!data) return null;
                return {
                    tokenId: data[0] as bigint,
                    resourceId: data[1] as bigint
                };
            }
        }
    });
    
    // Get the owned NFT details based on resourceId
    const ownedNft = React.useMemo(() => {
        if (!nftInfo?.resourceId || nftInfo.resourceId <= 0n) return null;
        return AVAILABLE_NFTS.find(nft => BigInt(nft.id) === nftInfo.resourceId) || null;
    }, [nftInfo]);

    // Memoize the refetch function to maintain referential equality
    const stableRefetch = React.useCallback(() => {
        if (hasValidAddress) {
            return refetch();
        }
        return Promise.resolve({ data: null, error: null });
    }, [hasValidAddress, refetch]);

    // Determine loading state
    const isLoadingState = React.useMemo(() => {
        // If we have a valid address, use the query's loading state
        if (hasValidAddress) return isLoading;
        // If no address, we're still waiting for one
        return true;
    }, [hasValidAddress, isLoading]);

    return {
        nfts: AVAILABLE_NFTS,
        nftInfo: hasValidAddress ? nftInfo : null,
        ownedNft: hasValidAddress ? ownedNft : null,
        isLoading: isLoadingState,
        isError,
        refetch: stableRefetch
    };
}
