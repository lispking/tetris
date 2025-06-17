import { ethers } from "ethers";
import TetrisNFTContract from "../contracts/TetrisNFT.json";

export const tetrisNFTContract = (signer: ethers.ContractRunner) => {
  return new ethers.Contract(
    TetrisNFTContract.address.monadTestnet,
    TetrisNFTContract.abi,
    signer
  );
};
