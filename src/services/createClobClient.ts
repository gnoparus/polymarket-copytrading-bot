import { ethers } from 'ethers';
import { ClobClient, SignatureType } from '@polymarket/clob-client';
import { ENV } from '../config/env';
import { makeEthersSigner } from '../utils/ethersSignerAdapter';

const PROXY_WALLET = ENV.PROXY_WALLET;
const PRIVATE_KEY = ENV.PRIVATE_KEY;
const CLOB_HTTP_URL = ENV.CLOB_HTTP_URL;

const createClobClient = async (): Promise<ClobClient> => {
    const chainId = 137;
    const host = CLOB_HTTP_URL as string;
    const rawKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
    const wallet = new ethers.Wallet(rawKey);
    const signer = makeEthersSigner(wallet);
    let clobClient = new ClobClient(
        host,
        chainId,
        signer,
        undefined,
        SignatureType.POLY_PROXY,
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
        SignatureType.POLY_PROXY,
        PROXY_WALLET as string,
    );
    return clobClient;
};

export default createClobClient;
