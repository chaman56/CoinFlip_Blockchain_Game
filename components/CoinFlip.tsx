'use client'

import { useEffect, useState } from 'react';
import { flipCoin, iface } from '@/lib/contractInteraction';
import { ethers } from 'ethers';
import { Button } from './ui/button';
import { useWallet } from '@/lib/WalletContext';
import Image from 'next/image';
import { Bitcoin, ExternalLink, Link, LinkIcon } from 'lucide-react';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

interface GameResult {
    outcome: string; // "heads" or "tails"
    result: string;   // "You win!" or "You lose!"
    userWon : boolean;
    bet_amount: string; // The amount bet
    amt_change: string; // The amount change after the flip
    time: string; // Time of the transaction
    transactionHash: string; // Transaction hash
}

const CoinFlip: React.FC = () => {
    const [amount, setAmount] = useState<string>("0.0003");
    const [choice, setChoice] = useState<boolean | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const { connectWallet, signer } = useWallet();
    const [flipResult, setFlipResult] = useState<GameResult|null>(null);
    const [gameHistory, setGameHistory] = useState<GameResult[]>([]); // History of game results

    const handleFlipCoin = async () => {
        setProcessing(true);
        setErrorMessage("");
        setFlipResult(null);

        if (!signer || choice === null || !amount) {
            if (!signer) setErrorMessage("Please connect a wallet to play the game.");
            else if (!amount) setErrorMessage("Please enter a valid amount.");
            else if (choice === null) setErrorMessage("Please select heads or tails.");
            setProcessing(false);
            return;
        }

        try {
            const tx = await flipCoin(signer, choice, amount);
            const receipt = await tx.wait();
            console.log("Transaction:", tx);
            console.log("Transaction Receipt:", receipt);

            const log = receipt.logs[0];
            const decoded = iface.decodeEventLog("CoinFlipped", log.data, log.topics);
            console.log("Decoded Log:", decoded);
            const { outcome, userWon } = decoded;

            const resultMessage = userWon ? "You win!" : "You lose!";
            const coinOutcome = outcome ? "head" : "tail";
            
            const amtChange = userWon ? (parseFloat(amount) * 2).toFixed(4) : (parseFloat(amount)* -1).toFixed(4);

            const newGameResult: GameResult = {
                outcome:coinOutcome,
                result: resultMessage,
                userWon : userWon,
                bet_amount: amount,
                amt_change: amtChange,
                time: new Date().toLocaleString(), // Use blockTimestamp for the time
                transactionHash: tx.hash, // Store the transaction hash
            };
            setFlipResult(newGameResult);
            setGameHistory((prevHistory) => [newGameResult, ...prevHistory]);

            alert(`Transaction successful! Tx Hash: ${tx.hash}`);
        } catch (error) {
            console.error(error);
            alert("Transaction failed!");
        }
        setProcessing(false);
    };

    const handleSelectChange = (value: string) => {
        setChoice(value === '1');
    };

    return (
        <div className='flex flex-col items-center'>
            {signer ? (
                <div className='flex flex-col items-center'>
                    <div className=' inline-block'>
                    <div className='flex gap-3'>
                        <div>
                            <h2 className='flex opacity-50'><Bitcoin /> Amount in Ethereum</h2>
                            <Input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount in ETH"
                            />
                        </div>
                        <div>
                            <p className='opacity-50'>What will you bet on?</p>
                            <Select onValueChange={handleSelectChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Choose the bet." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select One</SelectLabel>
                                        <SelectItem value={'1'}>Heads</SelectItem>
                                        <SelectItem value={'0'}>Tails</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className='text-red-600'>{errorMessage}</div>
                    <div className='my-4 flex items-center'>
                        <Button className='' onClick={handleFlipCoin} disabled={processing}>
                            Flip Coin
                        </Button>
                        {processing && <img height={50} width={50} src='fliping_coin.gif' alt="flipping coin" />}
                        {flipResult && <div > <span className='text-2xl font-extralight text-orange-500 flex items-center'><img src={flipResult.outcome+".png "}  height={50} width={50}  alt="coin" />{flipResult?.outcome}</span></div>}
                    </div>

                    {flipResult && 
                        <>
                            <div className={' text-4xl font-extrabold '+ (flipResult.userWon? "text-green-500":"text-red-500")}>{flipResult?.result}</div>
                        </>
                    }
                    </div>
                    
                    { gameHistory.length!=0 &&
                    <div className="mt-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-500">Game History</h2>
                        <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[100px]">Win/Loose</TableHead>
                                <TableHead>Outcome</TableHead>
                                <TableHead>Amount Change</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead className="text-right">Hash</TableHead>
                                <TableHead className="text-right">View</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {gameHistory.map((game) => (
                                <TableRow key={game.transactionHash}>
                                  <TableCell className="font-medium">{game.result}</TableCell>
                                  <TableCell>{game.outcome}</TableCell>
                                  <TableCell>{game.amt_change}</TableCell>
                                  <TableCell>{game.time}</TableCell>
                                  <TableCell className="text-right">{game.transactionHash}</TableCell>
                                  <TableCell className="text-right"><a href={`https://sepolia.etherscan.io/tx/${game.transactionHash}`} target='_blank'> <ExternalLink /> </a></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                        </Table>
                    </div>
                    }
                </div>
            ) : (
                <div className='flex flex-col items-center font-extrabold text-center gap-2'>
                    <Image src='/wallet.png' alt='wallet' width={100} height={100} />
                    <p className='text-2xl opacity-50'>No wallet connected. <br /> Please connect a wallet to play the game.</p>
                    <Button className='p-4 m-4' onClick={connectWallet}><Link /> &nbsp; Connect Wallet</Button>
                </div>
            )}
        </div>
    );
};

export default CoinFlip;
