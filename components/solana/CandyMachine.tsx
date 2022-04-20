import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import Alert from '@material-ui/lab/Alert';
import { Container, Snackbar } from '@material-ui/core';
import * as anchor from '@project-serum/anchor'
import { GatewayProvider } from "@civic/solana-gateway-react";

import { MintButton } from './utils/CandyMachineMintButton';

import {
  CandyMachineAccount,
  getCandyMachineState,
  mintOneToken,
  awaitTransactionSignatureConfirmation
} from '../../utils/candy-machine';
import { AlertState } from '../../utils/utils';
import { DEFAULT_TIMEOUT } from '../../utils/constants'
import { sendTransaction } from '../../utils/connection';


interface CandyMachineProps {
  readonly candyMachineId: PublicKey,
  readonly candyMachineCollection: PublicKey,
  readonly rpcUrl: string,
  readonly price: number,
  setCandyMachineStateCallback: (cndy: CandyMachineAccount) => void,
  readonly isWhitelistOn: boolean,  // will only be on for Llama Agents
}

const CandyMachine = (props: CandyMachineProps) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>()
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [isWhitelistUser, setIsWhitelistUser] = useState(false)

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });

  // The Anchor wallet used for transaction
  const anchorWallet = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
      return
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  /*
   * A callback to refresh the state of the candy machine
  */
  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      console.log('refreshing')
      setIsWhitelistUser(false)
      candyMachine.state.isActive = false
      return
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          connection,
        )

        setCandyMachine(cndy)
        props.setCandyMachineStateCallback(cndy)

        console.log(`isActive: ${cndy.state.isActive}`)
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }

  }, [anchorWallet, props.candyMachineId, connection, wallet]);

  useEffect(() => { refreshCandyMachineState() }, [anchorWallet, connection])

  useEffect(() => {
    // Check whether the user is whitelisted if necessary
    if (props.isWhitelistOn && wallet.publicKey) {
      const response = fetch(`/api/isWhitelisted/${wallet.publicKey.toBase58()}`).then(
        response => response.json().then(
          resp => { 
            setIsWhitelistUser(resp.whitelisted) 
            console.log('is user whiteliste?', resp.whitelisted)
          }
        )
      )
    } else {
      setIsWhitelistUser(false)
    }
  }, [candyMachine, wallet])

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = [],
  ) => {
    try {
      setIsUserMinting(true);
      document.getElementById('#identity')?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {

        // Throw an error if the user is not whitelisted
        if (props.isWhitelistOn && !isWhitelistUser) {
          throw Error('User is not whitelisted')
        }

        let mintOne = await mintOneToken(
          candyMachine,
          props.candyMachineCollection,
          wallet.publicKey,
          beforeTransactions,
          afterTransactions,
        );

        const mintTxId = mintOne[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            DEFAULT_TIMEOUT,
            connection,
            true,
          );
        }

        if (status && !status.err) {
          // manual update since the refresh might not detect
          // the change immediately
          let remaining = candyMachine.state.itemsRemaining! - 1;
          candyMachine.state.isSoldOut = remaining === 0;
          setAlertState({
            open: true,
            message: 'Congratulations! Mint succeeded!',
            severity: 'success',
          });
        } else {
          setAlertState({
            open: true,
            message: 'Mint failed! Please try again!',
            severity: 'error',
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Minting failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x137')) {
          console.log(error);
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          console.log(error);
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: 'error',
      });
      // updates the candy machine state to reflect the lastest
      // information on chain
      refreshCandyMachineState();
    } finally {
      setIsUserMinting(false);
    }
  };

  const mintButton = (
    <MintButton
      onMint={onMint}
      candyMachine={candyMachine}
      isMinting={isUserMinting}
      setIsMinting={val => setIsUserMinting(val)}
      isUserWhitelisted={isWhitelistUser}
      price={props.price}
    />
  )

  const gatewayTransactionHandler = async (transaction: Transaction) => {
    setIsUserMinting(true);
    const userMustSign = transaction.signatures.find(sig =>
      sig.publicKey.equals(wallet.publicKey!),
    );
    if (userMustSign) {
      setAlertState({
        open: true,
        message: 'Please sign one-time Civic Pass issuance',
        severity: 'info',
      });
      try {
        transaction = await wallet.signTransaction!(transaction)
      } catch (e) {
        setAlertState({
          open: true,
          message: 'User cancelled signing',
          severity: 'error',
        });
        // setTimeout(() => window.location.reload(), 2000);
        setIsUserMinting(false);
        throw e;
      }
    } else {
      setAlertState({
        open: true,
        message: 'Refreshing Civic Pass',
        severity: 'info',
      });
    }
    try {
      console.log(`Sending the transaction from within the gatekeeper`)
      await sendTransaction(
        connection,
        wallet,
        transaction,
        [],
        true,
        'confirmed',
      );
      setAlertState({
        open: true,
        message: 'Please sign minting',
        severity: 'info',
      });
    } catch (e) {
      setAlertState({
        open: true,
        message:
          'Solana dropped the transaction, please try again',
        severity: 'warning',
      });
      console.error(e);
      // setTimeout(() => window.location.reload(), 2000);
      setIsUserMinting(false);
      throw e;
    }
    console.log(`Calling onMint() from within the gatekeeper`)
    await onMint();
  }

  return (
    <Container maxWidth="xs" style={{ position: 'relative' }}>
      {candyMachine?.state.gatekeeper &&
        wallet.publicKey && wallet.signTransaction ? (
        <GatewayProvider
          wallet={{
            publicKey: wallet.publicKey,
            //@ts-ignore
            signTransaction: wallet.signTransaction,
          }}
          gatekeeperNetwork={
            candyMachine?.state?.gatekeeper?.gatekeeperNetwork
          }
          clusterUrl={props.rpcUrl}
          handleTransaction={gatewayTransactionHandler}
          broadcastTransaction={false}
          options={{ autoShowModal: false }}
        >
          {mintButton}
        </GatewayProvider>
      ) : mintButton
      }

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CandyMachine;
