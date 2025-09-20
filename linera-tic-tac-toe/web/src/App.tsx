import { useState, useEffect } from 'react';
import './App.css';
import { LineraClient, createLineraClient, Game, GameStats, defaultConfig } from './lineraClient';

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Linera connection state
  const [nodeUrl, setNodeUrl] = useState(defaultConfig.nodeUrl || 'http://localhost:8080');
  const [applicationId, setApplicationId] = useState(defaultConfig.applicationId || '');
  const [chainId, setChainId] = useState(defaultConfig.chainId || '');
  
  // Linera client instance
  const [client, setClient] = useState<LineraClient | null>(null);

  // Initialize Linera client when configuration changes
  useEffect(() => {
    if (nodeUrl && applicationId && chainId) {
      const newClient = createLineraClient({
        nodeUrl,
        applicationId,
        chainId
      });
      setClient(newClient);
    } else {
      setClient(null);
    }
  }, [nodeUrl, applicationId, chainId]);

  // Load initial data
  useEffect(() => {
    if (client) {
      loadGames();
      loadStats();
    }
  }, [client]);

  const loadGames = async () => {
    if (!client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const gamesData = await client.queryGames();
      setGames(gamesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!client) return;
    
    try {
      const statsData = await client.queryStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCreateGame = async () => {
    if (!client) {
      setError('Please configure Linera connection first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await client.createGame();
      
      // Show success message with CLI instructions
      alert(`Game creation initiated! 

To create a game with Linera CLI, run:

linera request-application ${applicationId} \\
  --json-argument '{"CreateGame": {}}'

After running the command, refresh this page to see the new game.`);
      
      // Reload games after a short delay
      setTimeout(() => {
        loadGames();
        loadStats();
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    if (!client) {
      setError('Please configure Linera connection first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await client.joinGame(gameId);
      
      alert(`Join game request initiated!

To join game ${gameId} with Linera CLI, run:

linera request-application ${applicationId} \\
  --json-argument '{"JoinGame": {"game_id": ${gameId}}}'

After running the command, refresh this page to see the updated game.`);
      
      // Reload games after a short delay
      setTimeout(() => {
        loadGames();
        loadStats();
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeMove = async (gameId: string, row: number, col: number) => {
    if (!client) {
      setError('Please configure Linera connection first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await client.makeMove(gameId, row, col);
      
      alert(`Move request initiated!

To make a move with Linera CLI, run:

linera request-application ${applicationId} \\
  --json-argument '{"MakeMove": {"game_id": ${gameId}, "row": ${row}, "col": ${col}}}'

After running the command, refresh this page to see the updated game.`);
      
      // Reload games after a short delay
      setTimeout(() => {
        loadGames();
        loadStats();
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make move');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (client) {
      loadGames();
      loadStats();
    }
  };

  const renderBoard = (game: Game) => {
    return (
      <div className="board">
        {game.board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className="board-cell"
                onClick={() => handleMakeMove(game.id, rowIndex, colIndex)}
                disabled={
                  cell !== null || 
                  game.status !== 'In progress' || 
                  loading ||
                  !client
                }
              >
                {cell}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const isConfigured = nodeUrl && applicationId && chainId;

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 Linera Tic-Tac-Toe</h1>
        <p>Multiplayer tic-tac-toe on the Linera blockchain</p>
      </header>

      {/* Connection Configuration */}
      <div className="connection-config">
        <h2>🔗 Linera Connection</h2>
        <div className="config-inputs">
          <div className="input-group">
            <label>Node URL:</label>
            <input
              type="text"
              value={nodeUrl}
              onChange={(e) => setNodeUrl(e.target.value)}
              placeholder="http://localhost:8080"
            />
          </div>
          <div className="input-group">
            <label>Application ID:</label>
            <input
              type="text"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="Enter your application ID"
            />
          </div>
          <div className="input-group">
            <label>Chain ID:</label>
            <input
              type="text"
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
              placeholder="Enter your chain ID"
            />
          </div>
        </div>
        
        <div className="connection-status">
          {isConfigured ? (
            <div className="status-connected">
              ✅ Configuration complete - Ready to interact with Linera
            </div>
          ) : (
            <div className="status-disconnected">
              ⚠️ Please configure all connection parameters above
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ Error: {error}
        </div>
      )}

      {/* Game Statistics */}
      {stats && (
        <div className="stats-section">
          <div className="stats-header">
            <h2>📊 Game Statistics</h2>
            <button 
              className="refresh-button"
              onClick={handleRefresh}
              disabled={loading || !client}
            >
              🔄 Refresh
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalGames}</div>
              <div className="stat-label">Total Games</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.waitingGames}</div>
              <div className="stat-label">Waiting for Players</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.activeGames}</div>
              <div className="stat-label">Active Games</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.completedGames}</div>
              <div className="stat-label">Completed Games</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Actions */}
      <div className="actions-section">
        <h2>🎯 Game Actions</h2>
        <button
          className="action-button create-game"
          onClick={handleCreateGame}
          disabled={loading || !isConfigured}
        >
          {loading ? '⏳ Creating...' : '🆕 Create New Game'}
        </button>
      </div>

      {/* Games List */}
      <div className="games-section">
        <h2>🎲 Games</h2>
        {games.length === 0 ? (
          <div className="no-games">
            <p>No games found. Create a new game to get started!</p>
          </div>
        ) : (
          <div className="games-grid">
            {games.map((game) => (
              <div key={game.id} className="game-card">
                <div className="game-header">
                  <h3>Game #{game.id}</h3>
                  <span className={`status ${game.status.toLowerCase().replace(' ', '-')}`}>
                    {game.status}
                  </span>
                </div>
                
                <div className="game-info">
                  <div className="players">
                    <div>👤 Player X: {game.playerX}</div>
                    <div>👤 Player O: {game.playerO || 'Waiting...'}</div>
                  </div>
                  <div className="current-turn">
                    Current Turn: <strong>{game.currentPlayer}</strong>
                  </div>
                  <div className="chain-info">
                    Chain: {game.chainId}
                  </div>
                </div>

                {renderBoard(game)}

                <div className="game-actions">
                  {game.status === 'Waiting for player' && (
                    <button
                      className="action-button join-game"
                      onClick={() => handleJoinGame(game.id)}
                      disabled={loading || !isConfigured}
                    >
                      🤝 Join Game
                    </button>
                  )}
                  <button
                    className="action-button view-game"
                    onClick={() => setSelectedGame(game)}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CLI Instructions */}
      <div className="cli-section">
        <h2>💻 CLI Commands</h2>
        <p>Use these commands with the Linera CLI to interact with your tic-tac-toe application:</p>
        
        <div className="cli-commands">
          <div className="cli-command">
            <h4>Create a Game:</h4>
            <code>
              linera request-application {applicationId || '<APPLICATION_ID>'} \<br/>
              &nbsp;&nbsp;--json-argument '{`{"CreateGame": {}}`}'
            </code>
          </div>
          
          <div className="cli-command">
            <h4>Join a Game:</h4>
            <code>
              linera request-application {applicationId || '<APPLICATION_ID>'} \<br/>
              &nbsp;&nbsp;--json-argument '{`{"JoinGame": {"game_id": 0}}`}'
            </code>
          </div>
          
          <div className="cli-command">
            <h4>Make a Move:</h4>
            <code>
              linera request-application {applicationId || '<APPLICATION_ID>'} \<br/>
              &nbsp;&nbsp;--json-argument '{`{"MakeMove": {"game_id": 0, "row": 1, "col": 1}}`}'
            </code>
          </div>
          
          <div className="cli-command">
            <h4>Query Games:</h4>
            <code>
              linera query-application {applicationId || '<APPLICATION_ID>'} \<br/>
              &nbsp;&nbsp;--json-argument '{`{"games": {}}`}'
            </code>
          </div>
          
          <div className="cli-command">
            <h4>Query Game Statistics:</h4>
            <code>
              linera query-application {applicationId || '<APPLICATION_ID>'} \<br/>
              &nbsp;&nbsp;--json-argument '{`{"stats": {}}`}'
            </code>
          </div>
        </div>
      </div>

      {/* Game Details Modal */}
      {selectedGame && (
        <div className="modal-overlay" onClick={() => setSelectedGame(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Game #{selectedGame.id} Details</h3>
              <button className="close-button" onClick={() => setSelectedGame(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="game-details">
                <p><strong>Status:</strong> {selectedGame.status}</p>
                <p><strong>Player X:</strong> {selectedGame.playerX}</p>
                <p><strong>Player O:</strong> {selectedGame.playerO || 'Not joined'}</p>
                <p><strong>Current Turn:</strong> {selectedGame.currentPlayer}</p>
                <p><strong>Chain ID:</strong> {selectedGame.chainId}</p>
              </div>
              {renderBoard(selectedGame)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
