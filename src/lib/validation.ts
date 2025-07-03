import { Keypair, PublicKey } from "@solana/web3.js";

export function validatePublicKey(address: string): boolean | string {
    try {
        new PublicKey(address);
        return true;
    } catch {
        return 'Please enter a valid Solana public key';
    }
}

export function validateAmount(amount: string): boolean | string {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
        return 'Please enter a valid positive number';
    }
    return true;
}

export function validateMintAddress(mintAddress: string): boolean | string {
    try {
        new PublicKey(mintAddress);
        return true;
    } catch {
        return 'Please enter a valid token mint address';
    }
}

export function validateSendTokenOptions(
    senderKeypair: Keypair,
    receiverPublicKey: PublicKey,
    amount: number,
    mintAddress: string
): void {
    if (!senderKeypair) {
        throw new Error('Invalid sender keypair');
    }
    
    if (!receiverPublicKey) {
        throw new Error('Invalid receiver public key');
    }
    
    if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }
    
    try {
        new PublicKey(mintAddress);
    } catch {
        throw new Error('Invalid mint address');
    }
}