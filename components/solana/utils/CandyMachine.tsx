import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import Alert from '@material-ui/lab/Alert';
import { Container, Grid, Paper, Typography, Snackbar } from '@material-ui/core';
import * as anchor from '@project-serum/anchor'
import { GatewayProvider } from "@civic/solana-gateway-react";
import styled from 'styled-components';

import { MintButton } from './CandyMachineMintButton';
import { MintCountdown } from './MintCountdown';

import { 
  CandyMachineAccount, 
  getCandyMachineState, 
  mintOneToken,
  awaitTransactionSignatureConfirmation
} from '../../../utils/candy-machine';
import { AlertState, getAtaForMint, toDate, formatNumber } from '../../../utils/utils';
import { DEFAULT_TIMEOUT } from '../../../utils/constants'
import { sendTransaction } from '../../../utils/connection';


const MintContainer = styled.div``; // add your owns styles here

interface CandyMachineProps {
  readonly candyMachineId: PublicKey,
  readonly candyMachineCollection: PublicKey,
  readonly rpcUrl: string,
}

const CandyMachine = (props: CandyMachineProps) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>()

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });

  const [isActive, setIsActive] = useState(false)
  const [endDate, setEndDate] = useState<Date>()
  const [itemsRemaining, setItemsRemaining] = useState<number>()
  const [isWhitelistUser, setIsWhitelistUser] = useState(false)
  const [isPresale, setIsPresale] = useState(false)
  const [discountPrice, setDiscountPrice] = useState<anchor.BN>()

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          connection,
        )

        // Has the `goLiveDate` passed?
        const currentTime = new Date().getTime() / 1000
        let active = cndy?.state.goLiveDate?.toNumber() < currentTime
        let presale = false
        
        // Is there a whitelist mint?
        if (cndy?.state.whitelistMintSettings) {

          // Is the presale ON?
          if (cndy.state.whitelistMintSettings.presale &&
              (!cndy.state.goLiveDate || cndy.state.goLiveDate.toNumber() > currentTime)
          ) {
            presale = true
          }

          // Is there a discount?
          if (cndy.state.whitelistMintSettings.discountPrice) {
            setDiscountPrice(cndy.state.whitelistMintSettings.discountPrice)
          } else {
            setDiscountPrice(undefined)

            // When presale = false and discountPrice = null, mint is restricted to whitelist
            // users only
            if (!cndy.state.whitelistMintSettings.presale) {
              cndy.state.isWhitelistOnly = true
            }
          }

          // Retrieve the whitelist token
          const mint = new anchor.web3.PublicKey(cndy.state.whitelistMintSettings.mint)
          const token = (await getAtaForMint(mint, anchorWallet.publicKey))[0]

          try {
            // The user is on the whitelist if it has >0 whitelist tokens
            const balance = await connection.getTokenAccountBalance(token)
            let valid = parseInt(balance.value.amount) > 0
            setIsWhitelistUser(valid)
            console.log(`isWhitelistUser: ${valid}`)
            active = (presale && valid) || active
          } catch (e) {
            // The user cannot mint if doesn't have a whitelist token
            setIsWhitelistUser(false)
            if (cndy.state.isWhitelistOnly) {
              active = false
            }
            console.log('There was a problem fetching whitelist token balance')
            console.log(e)
          }
        }
        
        // Fetch the end date for the mint
        if (cndy?.state.endSettings?.endSettingType.date) {
          setEndDate(toDate(cndy.state.endSettings.number))
          if (cndy.state.endSettings.number.toNumber() < currentTime) {
            active = false
            presale = false
          }
        }

        // Check the maximum number of items have not been minted
        if (cndy?.state.endSettings?.endSettingType.amount) {
          let limit = Math.min(
            cndy.state.endSettings.number.toNumber(),
            cndy.state.itemsAvailable,
          );
          if (cndy.state.itemsRedeemed < limit) {
            setItemsRemaining(limit - cndy.state.itemsRedeemed);
          } else {
            setItemsRemaining(0);
            cndy.state.isSoldOut = true;
          }
        } else {
          setItemsRemaining(cndy.state.itemsRemaining);
        }

        // The Candy Machine is no longer active if it's sold-out
        if (cndy.state.isSoldOut) {
          active = false;
          presale = false;
        }

        setIsActive((cndy.state.isActive = active));
        setIsPresale((cndy.state.isPresale = presale));
        setCandyMachine(cndy);

        console.log(`isActive: ${active}`)
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }
  }, [anchorWallet, props.candyMachineId, connection]);

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = [],
  ) => {
    try {
      setIsUserMinting(true);
      document.getElementById('#identity')?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
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
          let remaining = itemsRemaining! - 1;
          setItemsRemaining(remaining);
          setIsActive((candyMachine.state.isActive = remaining > 0));
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

  const toggleMintButton = () => {
    let active = !isActive || isPresale;

    if (active) {
      if (candyMachine!.state.isWhitelistOnly && !isWhitelistUser) {
        active = false;
      }
      if (endDate && Date.now() >= endDate.getTime()) {
        active = false;
      }
    }

    if (
      isPresale &&
      candyMachine!.state.goLiveDate &&
      candyMachine!.state.goLiveDate.toNumber() <= new Date().getTime() / 1000
    ) {
      setIsPresale((candyMachine!.state.isPresale = false));
    }

    setIsActive((candyMachine!.state.isActive = active));
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    connection,
    refreshCandyMachineState,
  ]);

  return (
    <Container style={{ marginTop: 100 }}>
      <Container maxWidth="xs" style={{ position: 'relative' }}>
        <Paper
          style={{
            padding: 24,
            paddingBottom: 10,
            backgroundColor: '#151A1F',
            borderRadius: 6,
          }}
        >
            <>
              {candyMachine && (
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  wrap="nowrap"
                >
                  <Grid item xs={3}>
                    <Typography variant="body2" color="textSecondary">
                      Remaining
                    </Typography>
                    <Typography
                      variant="h6"
                      color="textPrimary"
                      style={{
                        fontWeight: 'bold',
                      }}
                    >
                      {`${itemsRemaining}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      {isWhitelistUser && discountPrice
                        ? 'Discount Price'
                        : 'Price'}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="textPrimary"
                      style={{ fontWeight: 'bold' }}
                    >
                      {isWhitelistUser && discountPrice
                        ? `◎ ${formatNumber.asNumber(discountPrice)}`
                        : `◎ ${formatNumber.asNumber(
                            candyMachine.state.price,
                          )}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    {isActive && endDate && Date.now() < endDate.getTime() ? (
                      <>
                        <MintCountdown
                          key="endSettings"
                          date={getCountdownDate(candyMachine)}
                          style={{ justifyContent: 'flex-end' }}
                          status="COMPLETED"
                          onComplete={toggleMintButton}
                        />
                        <Typography
                          variant="caption"
                          align="center"
                          display="block"
                          style={{ fontWeight: 'bold' }}
                        >
                          TO END OF MINT
                        </Typography>
                      </>
                    ) : (
                      <>
                        <MintCountdown
                          key="goLive"
                          date={getCountdownDate(candyMachine)}
                          style={{ justifyContent: 'flex-end' }}
                          status={
                            candyMachine?.state?.isSoldOut ||
                            (endDate && Date.now() > endDate.getTime())
                              ? 'COMPLETED'
                              : isPresale
                              ? 'PRESALE'
                              : 'LIVE'
                          }
                          onComplete={toggleMintButton}
                        />
                        {isPresale &&
                          candyMachine.state.goLiveDate &&
                          candyMachine.state.goLiveDate.toNumber() >
                            new Date().getTime() / 1000 && (
                            <Typography
                              variant="caption"
                              align="center"
                              display="block"
                              style={{ fontWeight: 'bold' }}
                            >
                              UNTIL PUBLIC MINT
                            </Typography>
                          )}
                      </>
                    )}
                  </Grid>
                </Grid>
              )}
              <MintContainer>
                {candyMachine?.state.isActive &&
                candyMachine?.state.gatekeeper &&
                wallet.publicKey &&
                wallet.signTransaction ? (
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
                    handleTransaction={async (transaction: Transaction) => {
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
                          transaction = await wallet.signTransaction!(
                            transaction,
                          );
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
                    }}
                    broadcastTransaction={false}
                    options={{ autoShowModal: false }}
                  >
                    <MintButton
                      candyMachine={candyMachine}
                      isMinting={isUserMinting}
                      setIsMinting={val => setIsUserMinting(val)}
                      onMint={onMint}
                      isActive={isActive || (isPresale && isWhitelistUser)}
                    />
                  </GatewayProvider>
                ) : (
                  <MintButton
                    candyMachine={candyMachine}
                    isMinting={isUserMinting}
                    setIsMinting={val => setIsUserMinting(val)}
                    onMint={onMint}
                    isActive={isActive || (isPresale && isWhitelistUser)}
                  />
                )}
              </MintContainer>
            </>
          <Typography
            variant="caption"
            align="center"
            display="block"
            style={{ marginTop: 7, color: 'grey' }}
          >
            Powered by METAPLEX
          </Typography>
        </Paper>
      </Container>

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

const getCountdownDate = (
  candyMachine: CandyMachineAccount,
): Date | undefined => {
  if (
    candyMachine.state.isActive &&
    candyMachine.state.endSettings?.endSettingType.date
  ) {
    return toDate(candyMachine.state.endSettings.number);
  }

  return toDate(
    candyMachine.state.goLiveDate
      ? candyMachine.state.goLiveDate
      : candyMachine.state.isPresale
      ? new anchor.BN(new Date().getTime() / 1000)
      : undefined,
  );
};

export default CandyMachine;
