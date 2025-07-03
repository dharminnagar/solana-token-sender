# Solana Token Sender CLI

An interactive command-line tool for sending Native & SPL tokens on the Solana blockchain. Features an intuitive interface with prompts, validation, and support for both mainnet and devnet.

## Features

- 🚀 Interactive CLI with guided prompts
- 🔄 Support for both mainnet and devnet
- 💰 Send any SPL token to any address
- 🎯 Pre-configured common tokens (USDC, USDT, SOL)
- ✅ Input validation and error handling
- 🔐 Secure private key handling
- 📊 Transaction confirmation and explorer links
- 🎨 Beautiful colored output

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Make it globally available (optional)
npm link
```

## Usage

### Interactive Mode (Default)

Simply run the CLI and follow the prompts:

```bash
npm run dev
# or if globally installed
solana-token-sender
```

### Send Command

```bash
npm run dev send
# or
solana-token-sender send
```

### Help Command

```bash
npm run dev help
# or
solana-token-sender help
```

## Interactive Flow

1. **Enter Private Key**: Paste your wallet's private key in JSON array format
2. **Select Network**: Choose between devnet (recommended for testing) or mainnet
3. **Choose Token**: Select from common tokens or enter a custom mint address
4. **Enter Recipient**: Provide the recipient's wallet address
5. **Enter Amount**: Specify how many tokens to send
6. **Confirm Transaction**: Review details and confirm

## Security Notes

⚠️ **Important Security Considerations:**

- Never share your private key with anyone
- Always test on devnet first before using mainnet
- Double-check recipient addresses before confirming
- The tool does not store or transmit your private key anywhere
- Consider using a dedicated wallet for CLI operations

## Development

### Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
src/
├── cli.ts              # Main CLI entry point
├── commands/
│   └── send.ts         # Send token command
├── lib/
│   ├── transaction.ts  # Transaction logic
│   └── validation.ts   # Input validation
└── types/
    └── index.ts        # TypeScript types
```

## Common Tokens

The CLI includes pre-configured mint addresses for common tokens:

### Devnet
- **USDC**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
- **USDT**: `EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS`
- **SOL**: `So11111111111111111111111111111111111111112`

### Mainnet
- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- **SOL**: `So11111111111111111111111111111111111111112`

## Error Handling

The CLI handles various error scenarios:

- Invalid private key format
- Invalid public key addresses
- Invalid mint addresses
- Network connection issues
- Insufficient balance
- Transaction failures

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.