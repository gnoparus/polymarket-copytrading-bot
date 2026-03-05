import { ethers } from 'ethers';
import { ClobClient, SignatureType } from '@polymarket/clob-client';
import { ENV } from '../config/env';
import { makeEthersSigner } from './ethersSignerAdapter';

const PROXY_WALLET = ENV.PROXY_WALLET;
const privateKey = ENV.PRIVATE_KEY;
const CLOB_HTTP_URL = ENV.CLOB_HTTP_URL;

const createClobClient = async (): Promise<ClobClient> => {
    const chainId = 137;
    const host = CLOB_HTTP_URL as string;

    const rawKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

    let wallet: ethers.Wallet;
    try {
        wallet = new ethers.Wallet(rawKey);
    } catch (error: unknown) {
        throw new Error(
            `Failed to create wallet: ${(error as Error).message}. ` +
                `Please verify (without 0x prefix).`,
        );
    }

    const signer = makeEthersSigner(wallet);

    let clobClient = new ClobClient(
        host,
        chainId,
        signer,
        undefined,
        SignatureType.POLY_GNOSIS_SAFE,
        PROXY_WALLET as string,
    );

    const originalConsoleError = console.error;
    console.error = function () {};
    let creds = await clobClient.createApiKey();
    console.error = originalConsoleError;
    if (creds.key) {
        console.log('API Key created successfully');
    } else {
        creds = await clobClient.deriveApiKey();
        console.log('API Key derived successfully');
    }

    clobClient = new ClobClient(
        host,
        chainId,
        signer,
        creds,
        SignatureType.POLY_GNOSIS_SAFE,
        PROXY_WALLET as string,
    );
    return clobClient;
};

export default createClobClient;
