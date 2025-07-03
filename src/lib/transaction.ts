import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { RpcUrl } from "./rpcUrl";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import chalk from 'chalk';

export async function connectToRPC(devnet: boolean = true) {
  // Establish a connection to the blockchain
  console.log(chalk.blue('🔗 Connecting to the blockchain...'));
  const rpcUrl = devnet ? RpcUrl.DEVNET : RpcUrl.MAINNET;
  const connection = new Connection(rpcUrl, "confirmed");
  console.log(chalk.green('✅ Connected to the blockchain:'), chalk.cyan(connection.rpcEndpoint));
  return connection;
}

export async function createKeyPair(secretKey: string) {
  // Create a new keypair for the sender
  console.log(chalk.blue('🔑 Creating a new keypair...'));
  const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
  return keypair;
}

export async function createTx(sender: PublicKey, receiver: PublicKey, amount: number, connection: Connection, mintAddress?: string) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  if (!connection) {
    throw new Error("Failed to connect to the blockchain.");
  }

  const receiverPublicKey = new PublicKey(receiver);
  const transaction = new Transaction();

  // If mintAddress is provided, create SPL token transfer, otherwise create native SOL transfer
  if (mintAddress) {
    console.log(chalk.blue('📋 Creating SPL token transaction...'));
    console.log(chalk.gray(`   • Amount: ${amount} tokens`));
    console.log(chalk.gray(`   • Recipient: ${receiver}`));
    console.log(chalk.gray(`   • Token Mint: ${mintAddress}`));
    
    const mint = new PublicKey(mintAddress);

    // Get token information to calculate the correct amount with decimals
    console.log(chalk.blue('🔍 Getting token mint information...'));
    const mintInfo = await getMint(connection, mint);
    const adjustedAmount = Math.floor(amount * 10 ** mintInfo.decimals);
    console.log(chalk.gray(`   • Token decimals: ${mintInfo.decimals}`));
    console.log(chalk.gray(`   • Adjusted amount: ${adjustedAmount}`));

    // Get token accounts
    console.log(chalk.blue('🏦 Getting token accounts...'));
    const senderTokenAccount = await getAssociatedTokenAddress(mint, sender);
    const recipientTokenAccount = await getAssociatedTokenAddress(mint, receiverPublicKey);

    console.log(chalk.gray(`   • Sender token account: ${senderTokenAccount}`));
    console.log(chalk.gray(`   • Recipient token account: ${recipientTokenAccount}`));

    // Check if recipient token account exists
    console.log(chalk.blue('🔍 Checking recipient token account...'));
    const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
    if (!recipientAccountInfo) {
      console.log(chalk.yellow('⚠️  Recipient token account does not exist. Creating...'));
      transaction.add(
        createAssociatedTokenAccountInstruction(  
          sender,
          recipientTokenAccount,
          receiverPublicKey,
          mint
        )
      );
    } else {
      console.log(chalk.green('✅ Recipient token account exists'));
    }

    // Add the token transfer instruction
    console.log(chalk.blue('➕ Adding token transfer instruction...'));
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        sender,
        adjustedAmount
      )
    );
  } else {
    console.log(chalk.blue('📋 Creating native SOL transaction...'));
    console.log(chalk.gray(`   • Amount: ${amount} SOL`));
    console.log(chalk.gray(`   • Recipient: ${receiver}`));
    console.log(chalk.gray(`   • Lamports: ${amount * 1e9}`));
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: receiverPublicKey,
        lamports: amount * 1e9,
      })
    );
  }

  // Set transaction parameters
  console.log(chalk.blue('⚙️  Setting transaction parameters...'));
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.feePayer = sender;
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  console.log(chalk.green('✅ Transaction created successfully'));
  console.log(chalk.gray(`   • Fee payer: ${sender}`));
  console.log(chalk.gray(`   • Recent blockhash: ${blockhash}`));
  console.log(chalk.gray(`   • Last valid block height: ${lastValidBlockHeight}`));

  return transaction;
}

export async function sendTx(transaction: Transaction, senderKeypair: Keypair, connection: Connection) {
  try {
    console.log(chalk.blue('📡 Sending transaction to the network...'));
    const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
    return signature;
  } catch (error) {
    console.error(chalk.red('❌ Error sending transaction:'), error);
    throw error;
  }
}

export async function createAndSendTx(senderKeypair: Keypair, receiver: PublicKey, amount: number, mintAddress?: string, devnet: boolean = true) {
    try {
        // Connect to the blockchain
        const connection = await connectToRPC(devnet);

        const transaction = await createTx(senderKeypair.publicKey, receiver, amount, connection, mintAddress);

        // Sign the transaction with the sender's private key
        console.log(chalk.blue('✍️  Signing transaction...'));
        transaction.sign(senderKeypair);
        console.log(chalk.green('✅ Transaction signed successfully'));

        // Send the transaction
        const signature = await sendTx(transaction, senderKeypair, connection);
        return signature;
    } catch (error) {
        console.error(chalk.red.bold('❌ Error in transaction process:'), error);
        throw error;
    }
}