import { ethers } from 'ethers';
import { ClobClient } from '@polymarket/clob-client';
import { SignatureType } from '@polymarket/order-utils';
import { ENV } from '../config/env';

const PROXY_WALLET = ENV.PROXY_WALLET;
const privateKey = ENV.PRIVATE_KEY;
const CLOB_HTTP_URL = ENV.CLOB_HTTP_URL;

const createClobClient = async (): Promise<ClobClient> => {
    const chainId = 137;
    const host = CLOB_HTTP_URL as string;
    
    const targetwallet = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    let wallet: ethers.Wallet;
    try {
        wallet = new ethers.Wallet(targetwallet);
    } catch (error: any) {
        throw new Error(
            `Failed to create wallet: ${error.message}. ` +
            `Please verify  (without 0x prefix).`
        );
    }
    let clobClient = new ClobClient(
        host,
        chainId,
        wallet,
        undefined,
        SignatureType.POLY_GNOSIS_SAFE,
        PROXY_WALLET as string
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
        wallet,
        creds,
        SignatureType.POLY_GNOSIS_SAFE,
        PROXY_WALLET as string
    );
    return clobClient;
};

export default createClobClient;
