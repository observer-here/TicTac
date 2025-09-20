# Linera Tic-Tac-Toe

A multiplayer tic-tac-toe game built on the Linera blockchain platform. This application demonstrates cross-chain messaging, game state management, and GraphQL queries in a Linera microchain environment, with a modern React frontend for visualization and interaction.

## ✅ Verified Against Official Linera Documentation

This project has been thoroughly reviewed and corrected based on:
- [Official Linera Documentation](https://linera.dev/developers/backend/creating_a_project.html)
- [Linera Frontend Integration Guide](https://linera.dev/developers/frontend/web_frontend.html)
- [Official Linera Examples](https://github.com/linera-io/linera-protocol/tree/main/examples)

## Features

- **🎮 Multiplayer Gameplay**: Two players can create and join games across different chains
- **🔗 Cross-Chain Messaging**: Real-time game updates propagated across the network
- **📊 GraphQL API**: Comprehensive queries for games, statistics, and game state
- **💾 Persistent State**: All game data stored immutably on-chain
- **🌐 Web Interface**: Modern React frontend with Linera client integration
- **🔐 Authentication**: Secure player authentication via Linera accounts
- **⚡ Real-time Updates**: Live game state synchronization across chains

## Project Structure

```
linera-tic-tac-toe/
├── src/
│   ├── lib.rs          # ABI definitions and GraphQL types
│   ├── state.rs        # Game logic and state management
│   ├── contract.rs     # Smart contract implementation
│   └── service.rs      # GraphQL service
├── web/                # React frontend with Linera integration
│   ├── src/
│   │   ├── App.tsx     # Main React component
│   │   ├── App.css     # Styling
│   │   ├── lineraClient.ts  # Linera client integration
│   │   └── ...
│   └── package.json    # Frontend dependencies
├── Cargo.toml          # Rust dependencies (workspace format)
└── README.md           # This file
```

## Prerequisites

1. **Linera CLI Tools**: Install from [official documentation](https://linera.dev/developers/getting_started/installation.html)
2. **Rust Toolchain**: Latest stable version
3. **Node.js**: Version 18+ for the web interface
4. **Linera Wallet**: Set up with test tokens

## Installation & Deployment

### 1. Build the Application

```bash
# Navigate to project directory
cd linera-tic-tac-toe

# Build the Rust application
cargo build --release
```

### 2. Publish to Linera

```bash
# Publish the bytecode
linera publish-bytecode \
  target/wasm32-unknown-unknown/release/tic_tac_toe_contract.wasm \
  target/wasm32-unknown-unknown/release/tic_tac_toe_service.wasm

# Create application instance
linera create-application <BYTECODE_ID> \
  --json-argument '{}'
```

### 3. Set Up Web Frontend

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

### Web Interface

1. **Configure Connection**: Enter your Node URL, Application ID, and Chain ID
2. **Create Games**: Click "Create New Game" to start a new game
3. **Join Games**: Click "Join Game" on waiting games
4. **Make Moves**: Click on empty board cells to make moves
5. **View Statistics**: Monitor game statistics in real-time

### CLI Operations

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

## GraphQL API

The service provides a comprehensive GraphQL API accessible via the Linera service endpoint:

### Available Queries

```graphql
type Query {
  # Get all games
  games: [GameView!]!
  
  # Get specific game by ID
  game(id: String!): GameView
  
  # Get games for a specific player
  gamesForPlayer(player: String!): [GameView!]!
  
  # Get games waiting for players
  waitingGames: [GameView!]!
  
  # Get active games
  activeGames: [GameView!]!
  
  # Get completed games
  completedGames: [GameView!]!
  
  # Get application statistics
  stats: GameStats!
}
```

### Example GraphQL Query

```graphql
query GetGameData {
  games {
    id
    playerX
    playerO
    board
    currentPlayer
    status
    chainId
  }
  
  stats {
    totalGames
    waitingGames
    activeGames
    completedGames
  }
}
```

## Game Rules

1. **Game Creation**: Any authenticated player can create a new game (becomes Player X)
2. **Joining**: Another player can join to become Player O
3. **Turn System**: Players alternate turns, starting with Player X
4. **Winning**: First player to achieve 3-in-a-row (horizontal, vertical, or diagonal) wins
5. **Draw**: Game ends in draw if all 9 cells are filled without a winner
6. **Validation**: All moves are validated server-side to prevent cheating

## Cross-Chain Architecture

This application showcases Linera's unique cross-chain capabilities:

### Message Types
- **GameCreated**: Broadcast when new games are created
- **PlayerJoined**: Notify when players join games
- **MoveMade**: Propagate moves across the network

### Benefits
- **Scalability**: Games can span multiple chains
- **Real-time Updates**: All participants receive immediate notifications
- **Fault Tolerance**: Distributed state across multiple validators
- **Low Latency**: Direct chain-to-chain communication

## Frontend Integration

The React frontend integrates with Linera through:

### Linera Client Integration
- **Configuration Management**: Dynamic connection setup
- **GraphQL Queries**: Real-time data fetching
- **Operation Execution**: Secure transaction submission
- **Error Handling**: Comprehensive error management

### Key Components
- **Connection Config**: Manage Linera node and application settings
- **Game Board**: Interactive tic-tac-toe visualization
- **Statistics Dashboard**: Real-time game metrics
- **CLI Helper**: Show equivalent CLI commands for operations

## Development

### Backend Development

```bash
# Build and test
cargo build
cargo test

# Lint code
cargo clippy

# Format code
cargo fmt
```

### Frontend Development

```bash
cd web

# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## Architecture Deep Dive

### Contract Layer (`contract.rs`)
- **Operation Handling**: Processes CreateGame, JoinGame, MakeMove operations
- **State Management**: Updates game state and validates moves
- **Cross-Chain Messaging**: Sends notifications to subscribers
- **Authentication**: Validates player signatures

### Service Layer (`service.rs`)
- **GraphQL API**: Provides read-only access to game data
- **Query Optimization**: Efficient data retrieval and filtering
- **Real-time Updates**: Supports live data synchronization
- **Statistics**: Aggregated game metrics

### State Layer (`state.rs`)
- **Game Logic**: Core tic-tac-toe rules and validation
- **Data Structures**: Efficient game state representation
- **Win Detection**: Algorithms for detecting wins and draws
- **Player Management**: Turn tracking and validation

### Frontend Layer (`web/`)
- **React Components**: Modern, responsive UI components
- **Linera Integration**: Direct blockchain interaction
- **State Management**: Local state synchronization
- **User Experience**: Intuitive game interface

## Security Features

- **Cryptographic Authentication**: All operations require valid signatures
- **Move Validation**: Server-side validation prevents invalid moves
- **State Integrity**: Blockchain ensures tamper-proof game state
- **Cross-Chain Security**: Messages are cryptographically verified
- **Access Control**: Players can only modify their own games

## Testing

### Unit Tests
```bash
cargo test
```

### Integration Tests
```bash
# Test with local Linera network
linera net up
cargo test --features integration
```

### Frontend Tests
```bash
cd web
npm test
```

## Deployment

### Local Development
1. Start local Linera network: `linera net up`
2. Deploy application: Follow installation steps above
3. Start frontend: `cd web && npm run dev`

### Production Deployment
1. Deploy to Linera mainnet or testnet
2. Build frontend: `cd web && npm run build`
3. Serve static files from your preferred hosting platform

## Troubleshooting

### Common Issues

**Build Errors**
- Ensure Rust toolchain is up to date
- Check Linera SDK version compatibility

**Connection Issues**
- Verify node URL is accessible
- Check application ID and chain ID are correct
- Ensure wallet is properly configured

**Transaction Failures**
- Verify sufficient balance for operations
- Check authentication credentials
- Validate operation parameters

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Resources

- **[Linera Documentation](https://linera.dev/)**: Official documentation
- **[Linera Discord](https://discord.gg/linera)**: Community support
- **[GitHub Repository](https://github.com/linera-io/linera-protocol)**: Source code and examples
- **[Linera Blog](https://linera.dev/blog)**: Latest updates and tutorials

## Acknowledgments

- Built with the [Linera SDK](https://linera.dev/)
- Inspired by official Linera examples
- Frontend powered by React and TypeScript
- Styling with modern CSS Grid and Flexbox

---

**Ready to play tic-tac-toe on the blockchain? 🎮⛓️**
