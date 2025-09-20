# 🚀 Linera Tic-Tac-Toe Deployment Guide

## 📋 Complete Guide Based on Official Linera Documentation

This comprehensive guide covers the entire deployment process for the Linera Tic-Tac-Toe application, from setup to running the game on the blockchain.

## 🔧 Prerequisites

### 1. Install Linera CLI and Dependencies

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install required system dependencies
sudo apt update
sudo apt install -y build-essential pkg-config libssl-dev protobuf-compiler

# Install Linera CLI
cargo install linera-cli --git https://github.com/linera-io/linera-protocol.git
```

### 2. Verify Installation

```bash
linera --help
```

## 🏗️ Project Structure Review

Our Linera Tic-Tac-Toe project follows the official Linera application structure:

```
linera-tic-tac-toe/
├── Cargo.toml              # Project configuration
├── src/
│   ├── lib.rs              # ABI definitions and types
│   ├── state.rs            # Application state management
│   ├── contract.rs         # Smart contract logic
│   └── service.rs          # GraphQL service
├── web/                    # React frontend
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── lineraClient.ts # Linera client integration
│   │   └── App.css         # Styling
│   └── package.json
└── README.md
```

## 🔨 Building the Application

### 1. Fix Dependencies (Standalone Project)

Since this is a standalone project, we need to specify explicit dependencies:

```bash
cd linera-tic-tac-toe
cat > Cargo.toml << 'CARGO_EOF'
[package]
name = "tic-tac-toe"
version = "0.1.0"
authors = ["Linera <contact@linera.io>"]
edition = "2021"

[dependencies]
async-graphql = "7.0"
bcs = "0.1"
linera-sdk = { git = "https://github.com/linera-io/linera-protocol.git" }
log = "0.4"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
test-log = "0.2"

[target.'cfg(not(target_arch = "wasm32"))'.dev-dependencies]
linera-sdk = { git = "https://github.com/linera-io/linera-protocol.git", features = ["test", "wasmer"] }

[dev-dependencies]
linera-sdk = { git = "https://github.com/linera-io/linera-protocol.git", features = ["test"] }

[[bin]]
name = "tic_tac_toe_contract"
path = "src/contract.rs"

[[bin]]
name = "tic_tac_toe_service"
path = "src/service.rs"
CARGO_EOF
```

### 2. Build the Application

```bash
# Build the application
cargo build --release

# Verify the build
ls target/release/
```

## 🌐 Setting Up Linera Network

### 1. Start Local Linera Network

```bash
# Initialize a local test network
linera net up --testing-prng-seed 37

# This will start:
# - Local validator nodes
# - Proxy service
# - Initial chains and accounts
```

### 2. Check Network Status

```bash
# Check wallet status
linera wallet show

# List available chains
linera query-validators
```

## 📦 Publishing and Deploying

### 1. Publish Bytecode

```bash
# Publish the application bytecode to the blockchain
linera publish-bytecode \
    target/wasm32-unknown-unknown/release/tic_tac_toe_contract.wasm \
    target/wasm32-unknown-unknown/release/tic_tac_toe_service.wasm

# Note the returned BYTECODE_ID for next step
```

### 2. Create Application

```bash
# Create the application instance
linera create-application <BYTECODE_ID>

# Note the returned APPLICATION_ID for frontend configuration
```

### 3. Request Application on Other Chains (Optional)

```bash
# Request the application on additional chains
linera request-application <APPLICATION_ID> --target-chain-id <CHAIN_ID>
```

## 🎮 Using the Application

### 1. CLI Operations

#### Create a Game
```bash
linera request-application <APPLICATION_ID> \
    --json-argument '{"CreateGame": {}}'
```

#### Join a Game
```bash
linera request-application <APPLICATION_ID> \
    --json-argument '{"JoinGame": {"game_id": 0}}'
```

#### Make a Move
```bash
linera request-application <APPLICATION_ID> \
    --json-argument '{"MakeMove": {"game_id": 0, "row": 1, "col": 1}}'
```

#### Query Games
```bash
linera query-application <APPLICATION_ID> \
    --json-argument '{"games": {}}'
```

#### Query Statistics
```bash
linera query-application <APPLICATION_ID> \
    --json-argument '{"stats": {}}'
```

### 2. GraphQL Queries

The service provides a GraphQL endpoint accessible at:
```
http://localhost:8080/chains/<CHAIN_ID>/applications/<APPLICATION_ID>
```

Example queries:
```graphql
# Get all games
query {
  games {
    id
    playerX
    playerO
    board
    currentPlayer
    status
    chainId
  }
}

# Get game statistics
query {
  stats {
    totalGames
    waitingGames
    activeGames
    completedGames
  }
}
```

## 🌐 Frontend Deployment

### 1. Configure Frontend

```bash
cd web

# Install dependencies
npm install

# Configure connection in src/lineraClient.ts
# Update defaultConfig with your values:
export const defaultConfig = {
  nodeUrl: 'http://localhost:8080',
  applicationId: '<YOUR_APPLICATION_ID>',
  chainId: '<YOUR_CHAIN_ID>'
};
```

### 2. Run Frontend

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

### 3. Access Frontend

Open your browser to `http://localhost:3000` and:

1. **Configure Connection**: Enter your Node URL, Application ID, and Chain ID
2. **Create Games**: Click "Create New Game" 
3. **Join Games**: Click "Join Game" on waiting games
4. **Play**: Click on board cells to make moves
5. **View Stats**: Monitor game statistics in real-time

## 🔍 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clean and rebuild
   cargo clean
   cargo build --release
   ```

2. **Network Connection Issues**
   ```bash
   # Restart local network
   linera net down
   linera net up --testing-prng-seed 37
   ```

3. **Application Not Found**
   ```bash
   # Verify application exists
   linera query-application <APPLICATION_ID>
   ```

4. **Frontend Connection Issues**
   - Verify Node URL is accessible
   - Check Application ID and Chain ID are correct
   - Ensure CORS is properly configured

### Logs and Debugging

```bash
# View application logs
linera service --port 8080

# Enable debug logging
RUST_LOG=debug linera service --port 8080

# Check chain state
linera query-balance
linera wallet show
```

## 🚀 Production Deployment

### 1. Deploy to Testnet

```bash
# Connect to Linera testnet
linera wallet init --with-new-chain --faucet https://faucet.testnet.linera.net

# Follow the same deployment steps with testnet endpoints
```

### 2. Deploy to Mainnet

```bash
# Connect to Linera mainnet (when available)
linera wallet init --with-new-chain

# Use production endpoints and follow security best practices
```

## 📚 Additional Resources

- [Official Linera Documentation](https://linera.dev/)
- [Linera SDK Reference](https://docs.rs/linera-sdk/)
- [Example Applications](https://github.com/linera-io/linera-protocol/tree/main/examples)
- [GraphQL Documentation](https://async-graphql.github.io/async-graphql/)

## 🎯 Next Steps

1. **Extend Functionality**: Add tournaments, rankings, or betting features
2. **Cross-Chain Gaming**: Enable games across multiple chains
3. **Mobile App**: Create React Native or Flutter mobile interface
4. **Integration**: Connect with other Linera applications
5. **Monetization**: Add token rewards or NFT integration

---

**🎮 Happy Gaming on Linera!** 

Your tic-tac-toe application is now ready for deployment on the Linera blockchain. Follow this guide step-by-step for a successful deployment.
