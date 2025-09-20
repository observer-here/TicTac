// Linera Client Integration for Tic-Tac-Toe
// Based on official Linera documentation and examples

export interface LineraClientConfig {
  nodeUrl: string;
  applicationId: string;
  chainId: string;
}

export interface Game {
  id: string;
  playerX: string;
  playerO?: string;
  board: (string | null)[][];
  currentPlayer: string;
  status: string;
  chainId: string;
}

export interface GameStats {
  totalGames: number;
  waitingGames: number;
  activeGames: number;
  completedGames: number;
}

export class LineraClient {
  private config: LineraClientConfig;

  constructor(config: LineraClientConfig) {
    this.config = config;
  }

  // Query operations (read-only)
  async queryGames(): Promise<Game[]> {
    try {
      // TODO: Replace with actual Linera client call
      // This would use the official @linera/client library
      const query = `
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
      `;
      
      // Mock implementation for now
      console.log('Querying games with GraphQL:', query);
      
      // In a real implementation, this would be:
      // const response = await this.graphqlQuery(query);
      // return response.data.games;
      
      return this.getMockGames();
    } catch (error) {
      console.error('Failed to query games:', error);
      throw error;
    }
  }

  async queryGame(gameId: string): Promise<Game | null> {
    try {
      const query = `
        query GetGame($id: String!) {
          game(id: $id) {
            id
            playerX
            playerO
            board
            currentPlayer
            status
            chainId
          }
        }
      `;
      
      console.log(`Querying game ${gameId} with GraphQL:`, query);
      
      // Mock implementation
      const games = await this.queryGames();
      return games.find(game => game.id === gameId) || null;
    } catch (error) {
      console.error(`Failed to query game ${gameId}:`, error);
      throw error;
    }
  }

  async queryStats(): Promise<GameStats> {
    try {
      const query = `
        query {
          stats {
            totalGames
            waitingGames
            activeGames
            completedGames
          }
        }
      `;
      
      console.log('Querying stats with GraphQL:', query);
      
      // Mock implementation
      return {
        totalGames: 2,
        waitingGames: 1,
        activeGames: 1,
        completedGames: 0
      };
    } catch (error) {
      console.error('Failed to query stats:', error);
      throw error;
    }
  }

  // Operation methods (write operations)
  async createGame(): Promise<void> {
    try {
      // TODO: Replace with actual Linera operation call
      // This would use the official @linera/client library
      const operation = {
        CreateGame: {}
      };
      
      console.log('Creating game with operation:', operation);
      
      // In a real implementation, this would be:
      // await this.executeOperation(operation);
      
      // For now, show the CLI command
      this.showCliCommand('CreateGame', operation);
    } catch (error) {
      console.error('Failed to create game:', error);
      throw error;
    }
  }

  async joinGame(gameId: string): Promise<void> {
    try {
      const operation = {
        JoinGame: {
          game_id: parseInt(gameId)
        }
      };
      
      console.log(`Joining game ${gameId} with operation:`, operation);
      
      // Show the CLI command
      this.showCliCommand('JoinGame', operation);
    } catch (error) {
      console.error(`Failed to join game ${gameId}:`, error);
      throw error;
    }
  }

  async makeMove(gameId: string, row: number, col: number): Promise<void> {
    try {
      const operation = {
        MakeMove: {
          game_id: parseInt(gameId),
          row,
          col
        }
      };
      
      console.log(`Making move in game ${gameId} at (${row}, ${col}) with operation:`, operation);
      
      // Show the CLI command
      this.showCliCommand('MakeMove', operation);
    } catch (error) {
      console.error(`Failed to make move in game ${gameId}:`, error);
      throw error;
    }
  }

  // Helper methods
  private showCliCommand(operationType: string, operation: any): void {
    const command = `linera request-application ${this.config.applicationId} \\
  --json-argument '${JSON.stringify(operation)}'`;
    
    console.log(`To execute ${operationType}, run:`);
    console.log(command);
  }

  // Mock data for development
  private getMockGames(): Game[] {
    return [
      {
        id: '0',
        playerX: 'Player1',
        playerO: 'Player2',
        board: [
          ['X', 'O', 'X'],
          ['O', 'X', 'O'],
          ['X', null, null]
        ],
        currentPlayer: 'O',
        status: 'In progress',
        chainId: this.config.chainId || 'chain1'
      },
      {
        id: '1',
        playerX: 'Player3',
        playerO: undefined,
        board: [
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ],
        currentPlayer: 'X',
        status: 'Waiting for player',
        chainId: this.config.chainId || 'chain2'
      }
    ];
  }
}

// Factory function to create a Linera client
export function createLineraClient(config: LineraClientConfig): LineraClient {
  return new LineraClient(config);
}

// Default configuration
export const defaultConfig: Partial<LineraClientConfig> = {
  nodeUrl: 'http://localhost:8080',
  applicationId: '',
  chainId: ''
};
