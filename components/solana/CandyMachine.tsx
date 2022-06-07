import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import Alert from '@material-ui/lab/Alert';
import { Container, Snackbar } from '@material-ui/core';
import * as anchor from '@project-serum/anchor'
import { GatewayProvider, GatewayStatus, useGateway } from '@civic/solana-gateway-react';

import { MintButton } from './CandyMachineMintButton';
import {
  CandyMachineAccount,
  getCandyMachineState,
  mintOneToken,
} from '../../utils/candy-machine';
import { AlertState } from '../../utils/utils';
import { DEFAULT_TIMEOUT } from '../../utils/constants'
import { sendTransaction, awaitTransactionSignatureConfirmation } from '../../utils/transaction';


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
  const { requestGatewayToken, gatewayStatus } = useGateway()

  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>(null)
  const [isUserMinting, setIsUserMinting] = useState(false)
  const [isWhitelistUser, setIsWhitelistUser] = useState(false)
  const [isUserAllowedToClick, setIsUserAllowedToClick] = useState(false)
  const [balance, setBalance] = useState(0.0)

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  })

  // The Anchor wallet used for transaction
  const anchorWallet = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
      return
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet
  }, [wallet])

  /*
   * A callback to refresh the state of the candy machine
  */
  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      setIsWhitelistUser(false)
      if (candyMachine !== null) { candyMachine.state.isActive = false }
      return
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(anchorWallet, props.candyMachineId, connection)
        setCandyMachine(cndy)
        props.setCandyMachineStateCallback(cndy)
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state')
        console.log(e)
      }
    }

  }, [anchorWallet, props.candyMachineId, connection, wallet])

  // Update the state of the Candy Machine
  useEffect(() => { refreshCandyMachineState() }, [anchorWallet, connection])

  // Update balance of user
  useEffect(() => {
    if (!(wallet.publicKey && wallet.connected)) { return }

    connection.getBalance(wallet.publicKey).then(balance => {
      setBalance(balance / LAMPORTS_PER_SOL)
    })
  }, [wallet, connection, candyMachine])

  // Update whether the user is whitelisted if necessary
  // If there's no whitelist, set to `true`
  useEffect(() => {
    if (props.isWhitelistOn && wallet.publicKey) {
      fetch(`/api/isWhitelisted/${wallet.publicKey.toBase58()}`).then(
        response => response.json().then(resp => {
          setIsWhitelistUser(resp.whitelisted)
        })
      )
    } else if (!props.isWhitelistOn) {
      setIsWhitelistUser(true)
    } else {
      setIsWhitelistUser(false)
    }
  }, [candyMachine, wallet])

  // Update whether the user is allowed to click
  useEffect(() => {
    const isAllowed = (
      wallet.connected && wallet.publicKey && candyMachine?.program && 
      candyMachine?.state.isActive && isWhitelistUser && balance >= props.price
    )
    
    console.log('is allowed:', isAllowed)
    setIsUserAllowedToClick(isAllowed)
  }, [wallet.connected, balance, connection, candyMachine, isWhitelistUser])

  const mintingWrapper = async () => {
    if (!isUserAllowedToClick) { 
      console.log('User is not allowed to mint')
    }
    
    try {
      setIsUserMinting(true)
        if (candyMachine?.state.gatekeeper) {
          console.log('Requesting a gatekeeper token before minting')
          await getGatewayReady()
        } else {
          console.log('Gatekeeper token not needed')
        }
        await onMint()
      showSuccessMessage()
    } catch (error: any) {
      showFailureMessage()
    } finally {
      setIsUserMinting(false)
    }
  }

  // A wrapper around the `min()` function to deal with the gateway
  const getGatewayReady = async () => {
    const network = candyMachine?.state.gatekeeper.gatekeeperNetwork.toBase58()
    console.log(`Gatekeeper network: ${network}`)
    if (network === 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6') {
      console.log('gatewayStatus:', gatewayStatus)
      if (gatewayStatus !== GatewayStatus.ACTIVE) {
        console.log(`Requesting gateaway keeper`)
        await requestGatewayToken()
      }
    } else {
      console.log(`Unknown Gatekeeper Network: ${network}`)
    }
  }

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = [],
  ) => {

    // Mint!
    console.log('about to call `mintOneToken`')
    let mintOne = await mintOneToken(
      candyMachine,
      props.candyMachineCollection,
      wallet.publicKey,
      beforeTransactions,
      afterTransactions,
    )
    console.log('all tx:', mintOne)

    // Fetch the status of the transaction
    const mintTxId = mintOne[0]
    let status: any = { err: true }
    if (mintTxId) {
      console.log('awaiting transaction confirmation')
      status = await awaitTransactionSignatureConfirmation(
        mintTxId,
        DEFAULT_TIMEOUT,
        connection,
      )
    }

    // Check for errors
    console.log('status:', status)
    if (status.err) {
      throw Error(status.err)
    }

    // updates the candy machine state to reflect the lastest
    // information on chain
    refreshCandyMachineState()
  }

  const showFailureMessage = () => {
    setAlertState({
      open: true,
      message: 'Mint failed! Please try again!',
      severity: 'error',
    })
  }

  const showSuccessMessage = () => {
    setAlertState({
      open: true,
      message: 'Congratulations! Mint succeeded!',
      severity: 'success',
    })
  }

  const mintButton = (
    <MintButton
      onMint={mintingWrapper}
      candyMachine={candyMachine}
      isMinting={isUserMinting}
      isUserWhitelisted={isWhitelistUser}
      isUserAllowedToClick={isUserAllowedToClick}
      balance={balance}
      price={props.price}
    />
  )

  const gatewayTransactionHandler = async (transaction: Transaction) => {
    
    // Check whether the user needs to sign
    const userMustSign = transaction.signatures.find(sig =>
      sig.publicKey.equals(wallet.publicKey!),
    )
    
    // Refrech the Civic Pass if needed
    if (userMustSign) {
      setAlertState({
        open: true,
        message: 'Please sign one-time Civic Pass issuance',
        severity: 'info',
      })

      try {
        transaction = await wallet.signTransaction!(transaction)
      } catch (e) {
        setAlertState({
          open: true,
          message: 'User cancelled signing',
          severity: 'error',
        })
        // setTimeout(() => window.location.reload(), 2000)
        throw e
      }
    } else {
      setAlertState({
        open: true,
        message: 'Refreshing Civic Pass',
        severity: 'info',
      })
    }

    // Try sending the transaction that was passed in
    try {
      console.log(`Sending the transaction from within the gatekeeper`)
      await sendTransaction(
        {
          transaction: transaction,
          wallet: anchorWallet,
          signers: [],
          connection: connection,
        }
      )
      setAlertState({
        open: true,
        message: 'Please sign minting',
        severity: 'info',
      })
    } catch (e) {
      setAlertState({
        open: true,
        message:
          'Solana dropped the transaction, please try again',
        severity: 'warning',
      })
      console.error(e)
      // setTimeout(() => window.location.reload(), 2000)
      throw e
    }
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
          gatekeeperNetwork={candyMachine?.state?.gatekeeper?.gatekeeperNetwork}
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
  )
}

export default CandyMachine
