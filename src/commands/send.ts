import { Keypair, PublicKey } from "@solana/web3.js";
import { createAndSendTx } from "../lib/transaction";
import { validateSendTokenOptions } from "../lib/validation";
import chalk from 'chalk';
import bs58 from 'bs58';

function parsePrivateKey(privateKeyInput: string): Uint8Array {
  try {
    // First try to parse as JSON array
    const parsed = JSON.parse(privateKeyInput);
    if (Array.isArray(parsed) && parsed.length === 64) {
      return Uint8Array.from(parsed);
    }
    throw new Error('Invalid JSON array format');
  } catch {
    // If JSON parsing fails, try Base58 format
    try {
      return bs58.decode(privateKeyInput);
    } catch {
      throw new Error('Invalid private key format. Must be Base58 or JSON array format');
    }
  }
}

export async function sendToken(senderSecret: string, receiverAddress: string, amount: number, mintAddress: string, devnet: boolean) {
    try {
        console.log(chalk.blue('🔐 Creating keypair...'));
        const privateKeyBytes = parsePrivateKey(senderSecret);
        const senderKeypair = Keypair.fromSecretKey(privateKeyBytes);
        const receiverPublicKey = new PublicKey(receiverAddress);

        console.log(chalk.blue('✅ Validating transaction parameters...'));
        // Validate the input options
        validateSendTokenOptions(senderKeypair, receiverPublicKey, amount, mintAddress);

        console.log(chalk.blue('📤 Sending transaction for processing...'));
        // Send the transaction
        let signature: string;
        if(mintAddress === "So11111111111111111111111111111111111111112") {
            const nativeSignature = await createAndSendTx(senderKeypair, receiverPublicKey, amount, undefined, devnet);

            signature = nativeSignature!;
        } else {
            const tokenSignature = await createAndSendTx(senderKeypair, receiverPublicKey, amount, mintAddress, devnet);

            signature = tokenSignature!;
        }
            
        console.log(chalk.green.bold('\n🎉 Transaction successful!'));
        console.log(chalk.white('Transaction signature:'), chalk.cyan(signature));
        
        const explorerUrl = devnet 
            ? `https://explorer.solana.com/tx/${signature}?cluster=devnet`
            : `https://explorer.solana.com/tx/${signature}`;
            
        console.log(chalk.white('View on Solana Explorer:'), chalk.blue.underline(explorerUrl));
        
    } catch (error) {
        console.error(chalk.red.bold('❌ Error sending token:'));
        if (error instanceof Error) {
            console.error(chalk.red(error.message));
        } else {
            console.error(chalk.red(String(error)));
        }
        throw error;
    }
}