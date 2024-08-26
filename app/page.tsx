import CoinFlip from "@/components/CoinFlip";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { WalletProvider } from "@/lib/WalletContext";
import Image from "next/image";

export default function Home() {
  return (
    <WalletProvider>
      <div className="flex flex-col items-center pt-4">
        <div className="p-7 font-extrabold text-transparent text-6xl bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Coin Flip Game</div>
        <CoinFlip />
      </div>
    </WalletProvider>
  );
}
