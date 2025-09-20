use linera_sdk::base::{AccountOwner, ChainId};
use serde::{Deserialize, Serialize};

/// The application state for the tic-tac-toe game
#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct TicTacToeState {
    /// All active games indexed by game ID
    pub games: std::collections::BTreeMap<u64, Game>,
    /// Counter for generating unique game IDs
    pub next_game_id: u64,
}

/// Represents a single tic-tac-toe game
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Game {
    /// Player X (first player)
    pub player_x: AccountOwner,
    /// Player O (second player), None if waiting for opponent
    pub player_o: Option<AccountOwner>,
    /// Current game board (3x3 grid)
    pub board: [[Option<Player>; 3]; 3],
    /// Current player's turn
    pub current_player: Player,
    /// Game status
    pub status: GameStatus,
    /// Chain ID where the game was created
    pub chain_id: ChainId,
}

/// Represents a player in the game
#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum Player {
    X,
    O,
}

/// Game status
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub enum GameStatus {
    WaitingForPlayer,
    InProgress,
    Won(Player),
    Draw,
}

impl Game {
    /// Create a new game with player X
    pub fn new(player_x: AccountOwner, chain_id: ChainId) -> Self {
        Self {
            player_x,
            player_o: None,
            board: [[None; 3]; 3],
            current_player: Player::X,
            status: GameStatus::WaitingForPlayer,
            chain_id,
        }
    }

    /// Join the game as player O
    pub fn join(&mut self, player_o: AccountOwner) -> Result<(), String> {
        if self.player_o.is_some() {
            return Err("Game already has two players".to_string());
        }
        if self.player_x == player_o {
            return Err("Cannot play against yourself".to_string());
        }
        self.player_o = Some(player_o);
        self.status = GameStatus::InProgress;
        Ok(())
    }

    /// Make a move on the board
    pub fn make_move(&mut self, player: &AccountOwner, row: usize, col: usize) -> Result<(), String> {
        // Validate game state
        if self.status != GameStatus::InProgress {
            return Err("Game is not in progress".to_string());
        }

        // Validate player turn
        let current_player_account = match self.current_player {
            Player::X => &self.player_x,
            Player::O => self.player_o.as_ref().ok_or("Player O not joined yet")?,
        };

        if player != current_player_account {
            return Err("Not your turn".to_string());
        }

        // Validate move position
        if row >= 3 || col >= 3 {
            return Err("Invalid position".to_string());
        }

        if self.board[row][col].is_some() {
            return Err("Position already occupied".to_string());
        }

        // Make the move
        self.board[row][col] = Some(self.current_player);

        // Check for win or draw
        if let Some(winner) = self.check_winner() {
            self.status = GameStatus::Won(winner);
        } else if self.is_board_full() {
            self.status = GameStatus::Draw;
        } else {
            // Switch turns
            self.current_player = match self.current_player {
                Player::X => Player::O,
                Player::O => Player::X,
            };
        }

        Ok(())
    }

    /// Check if there's a winner
    fn check_winner(&self) -> Option<Player> {
        // Check rows
        for row in 0..3 {
            if let Some(player) = self.board[row][0] {
                if self.board[row][1] == Some(player) && self.board[row][2] == Some(player) {
                    return Some(player);
                }
            }
        }

        // Check columns
        for col in 0..3 {
            if let Some(player) = self.board[0][col] {
                if self.board[1][col] == Some(player) && self.board[2][col] == Some(player) {
                    return Some(player);
                }
            }
        }

        // Check diagonals
        if let Some(player) = self.board[0][0] {
            if self.board[1][1] == Some(player) && self.board[2][2] == Some(player) {
                return Some(player);
            }
        }

        if let Some(player) = self.board[0][2] {
            if self.board[1][1] == Some(player) && self.board[2][0] == Some(player) {
                return Some(player);
            }
        }

        None
    }

    /// Check if the board is full
    fn is_board_full(&self) -> bool {
        for row in 0..3 {
            for col in 0..3 {
                if self.board[row][col].is_none() {
                    return false;
                }
            }
        }
        true
    }
}
