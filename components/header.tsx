'use client'

import React from 'react';
import { useWallet } from '@/lib/WalletContext';
import { Button } from './ui/button';

const Header: React.FC = () => {
  const { connectWallet, signer } = useWallet();

  return (
    <header className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center">
          <Button onClick={connectWallet}>
            {signer ? "Connected" : "Connect Wallet"}
          </Button>
        </div>
    </header>
  );
};

export default Header;