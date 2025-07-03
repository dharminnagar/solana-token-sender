#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { sendToken } from './commands/send';
import { validatePublicKey, validateAmount, validateMintAddress } from './lib/validation';

const program = new Command();

interface SendTokenAnswers {
  senderSecret: string;
  receiverAddress: string;
  amount: number;
  mintAddress: string;
  network: 'mainnet' | 'devnet';
}

const Tokens = {
    USDC: 'USDC',
    USDT: 'USDT',
    SOL: 'SOL'
} as const;

const commonMints = {
  devnet: {
    [Tokens.USDC]: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    [Tokens.USDT]: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS',
    [Tokens.SOL]: 'So11111111111111111111111111111111111111112',
  },
  mainnet: {
    [Tokens.USDC]: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    [Tokens.USDT]: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    [Tokens.SOL]: 'So11111111111111111111111111111111111111112',
  }
};

function validatePrivateKey(input: string): boolean | string {
  try {
    // First, try to parse as JSON array
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed) && parsed.length === 64) {
      // Validate that all elements are numbers between 0-255
      const isValidArray = parsed.every(num => 
        typeof num === 'number' && num >= 0 && num <= 255
      );
      if (isValidArray) {
        return true;
      }
    }
    return 'Invalid JSON array format. Must be 64 numbers between 0-255';
  } catch {
    // If JSON parsing fails, try Base58 format
    if (typeof input === 'string') {
      // Basic Base58 character check
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
      if (base58Regex.test(input)) {
        return true;
      }
    }
    return 'Please enter a valid private key in Base58 format (43-44 characters) or JSON array format ([1,2,3...])';
  }
}

async function promptForSendToken(): Promise<SendTokenAnswers> {
  console.log(chalk.blue.bold('\n🚀 Solana Token Sender CLI\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'senderSecret',
      message: 'Enter your wallet private key (Base58 or JSON array format):',
      validate: validatePrivateKey
    },
    {
      type: 'list',
      name: 'network',
      message: 'Select network:',
      choices: [
        { name: 'Devnet (recommended for testing)', value: 'devnet' },
        { name: 'Mainnet', value: 'mainnet' }
      ],
      default: 'devnet'
    },
    {
      type: 'list',
      name: 'tokenType',
      message: 'Choose token type:',
      choices: [
        { name: 'Common tokens (USDC, USDT, SOL)', value: 'common' },
        { name: 'Custom token (enter mint address)', value: 'custom' }
      ],
      default: 'common'
    },
    {
      type: 'list',
      name: 'commonToken',
      message: 'Select token:',
      choices: (answers: any) => {
        const network: 'devnet' | 'mainnet' = answers.network;
        return Object.keys(commonMints[network]).map(token => ({
          name: `${token} (${commonMints[network][token as keyof typeof commonMints[typeof network]]})`,
          value: commonMints[network][token as keyof typeof commonMints[typeof network]]
        }));
      },
      when: (answers: any) => answers.tokenType === 'common'
    },
    {
      type: 'input',
      name: 'customMint',
      message: 'Enter token mint address:',
      when: (answers: any) => answers.tokenType === 'custom',
      validate: validateMintAddress
    },
    {
      type: 'input',
      name: 'receiverAddress',
      message: 'Enter recipient wallet address:',
      validate: validatePublicKey
    },
    {
      type: 'input',
      name: 'amount',
      message: 'Enter amount to send:',
      validate: validateAmount,
      filter: (input: string) => parseFloat(input)
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: (answers: any) => {
        const mintAddress = answers.commonToken || answers.customMint;
        const network = answers.network;
        return chalk.yellow(`
📋 Transaction Summary:
   Network: ${network}
   Token Mint: ${mintAddress}
   Recipient: ${answers.receiverAddress}
   Amount: ${answers.amount}
   
Continue with this transaction?`);
      },
      default: false
    }
  ]);

  if (!answers.confirm) {
    console.log(chalk.red('❌ Transaction cancelled'));
    process.exit(0);
  }

  return {
    senderSecret: answers.senderSecret,
    receiverAddress: answers.receiverAddress,
    amount: answers.amount,
    mintAddress: answers.commonToken || answers.customMint,
    network: answers.network
  };
}

program
  .name('solana-token-sender')
  .description('Interactive CLI tool to send SPL tokens on Solana')
  .version('1.0.0');

program
  .command('send')
  .description('Send SPL tokens interactively')
  .action(async () => {
    try {
      const answers = await promptForSendToken();
      
      console.log(chalk.blue('\n🔄 Processing transaction...'));
      
      await sendToken(
        answers.senderSecret,
        answers.receiverAddress,
        answers.amount,
        answers.mintAddress,
        answers.network === 'devnet'
      );
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(chalk.blue.bold('\n🚀 Solana Token Sender CLI Help\n'));
    console.log(chalk.white('Commands:'));
    console.log(chalk.cyan('  send    ') + 'Send SPL tokens interactively');
    console.log(chalk.cyan('  help    ') + 'Show this help information');
    console.log(chalk.white('\nUsage:'));
    console.log(chalk.gray('  npx solana-token-sender send'));
    console.log(chalk.gray('  npx solana-token-sender help'));
    console.log(chalk.white('\nSecurity Notes:'));
    console.log(chalk.yellow('  • Never share your private key'));
    console.log(chalk.yellow('  • Always test on devnet first'));
    console.log(chalk.yellow('  • Double-check recipient addresses'));
  });

// Default command
program.action(async () => {
  try {
    const answers = await promptForSendToken();
    
    console.log(chalk.blue('\n🔄 Processing transaction...'));
    
    await sendToken(
      answers.senderSecret,
      answers.receiverAddress,
      answers.amount,
      answers.mintAddress,
      answers.network === 'devnet'
    );
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
});

program.parse();