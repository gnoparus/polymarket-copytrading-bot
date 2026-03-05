import { ethers } from 'ethers';

/**
 * Bridges an ethers v6 Wallet to the EthersSigner interface expected by
 * @polymarket/clob-client, which detects ethers signers by checking for
 * `_signTypedData` (the ethers v5 name). In ethers v6 this method was
 * renamed to `signTypedData`, so this adapter re-exposes it under the
 * legacy name.
 */
export const makeEthersSigner = (wallet: ethers.Wallet) => ({
    _signTypedData: (
        domain: Record<string, unknown>,
        types: Record<string, Array<{ name: string; type: string }>>,
        value: Record<string, unknown>,
    ) => wallet.signTypedData(domain, types as Parameters<typeof wallet.signTypedData>[1], value),
    getAddress: () => Promise.resolve(wallet.address),
});
