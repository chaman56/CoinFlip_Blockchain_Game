import { ethers } from 'ethers';
import CoinFlipABI from './CoinFlipABI.json';

const contractABI = CoinFlipABI.abi;

const contractAddress = process.env.CONTRACT_ADDRESS || "0xce045c75c92b09b0d3afca5f38f9631cb3e970c9";

export const flipCoin = async (
  signer: ethers.JsonRpcSigner,
  choice: boolean,
  amount: string
): Promise<ethers.ContractTransaction> => 
{
  if(!contractAddress)throw Error("Contract Address is Empty!");
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
  try {
    const tx = await contract.flipCoin(choice, { value: ethers.parseEther(amount) });

    return tx;
  } catch (error) {
    console.error("Transaction failed", error);
    throw error;
  }
};

export const iface = new ethers.Interface(contractABI);
