import { ethers } from 'ethers';

/**
 * Validates that a string is a well-formed Ethereum address.
 * Throws an error if the address is invalid.
 */
export const validateEthereumAddress = (address: string): void => {
    if (!ethers.utils.isAddress(address)) {
        throw new Error(`Invalid Ethereum address: ${address}`);
    }
};
