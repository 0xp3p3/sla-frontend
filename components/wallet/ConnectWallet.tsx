import React, { useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletMultiButton } from '../wallet-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';



interface Props {
  className: string,
}

const ConnectWallet = (props: Props) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    if (!(wallet.publicKey && wallet.connected)) { return }

    connection.getBalance(wallet.publicKey)
        .then(balance => setBalance(balance / LAMPORTS_PER_SOL))
  })

  return (
    <div>
      <WalletMultiButton className={props.className}></WalletMultiButton>
    </div>
  );
};

export default ConnectWallet