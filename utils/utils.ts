import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as mpl from '@metaplex/js';


export interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error' | undefined;
}

export const toDate = (value?: anchor.BN) => {
  if (!value) {
    return;
  }

  return new Date(value.toNumber() * 1000);
};

const numberFormater = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatNumber = {
  format: (val?: number) => {
    if (!val) {
      return '--';
    }

    return numberFormater.format(val);
  },
  asNumber: (val?: anchor.BN) => {
    if (!val) {
      return undefined;
    }

    return val.toNumber() / LAMPORTS_PER_SOL;
  },
};

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getUnixTs = (): number => {
  return new Date().getTime() / 1000;
};


export function sortAttributes(attributes: mpl.MetadataJsonAttribute[]): mpl.MetadataJsonAttribute[] {

  // Function to sort attributes in alphabetical order based on the `trait_type` property
  function compare(a, b) {
    if (a.trait_type < b.trait_type) { return -1 }
    if (a.trait_type > b.trait_type) { return 1 }
    else { return 0 }
  }

  // Sorts a copy of the original array
  const sorted = [...attributes].sort(compare)

  return sorted
}