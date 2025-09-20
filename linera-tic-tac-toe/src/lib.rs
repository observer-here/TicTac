use async_graphql::{Request, Response, SimpleObject};
use linera_sdk::base::{AccountOwner, ChainId};
use serde::{Deserialize, Serialize};

pub mod state;

use state::{Game, GameStatus, Player, TicTacToeState};

/// Operations that can be executed by the application.
#[derive(Debug, Deserialize, Serialize)]
pub enum Operation {
    /// Create a new game
    CreateGame,
    /// Join an existing game
    JoinGame { game_id: u64 },
    /// Make a move in a game
    MakeMove { game_id: u64, row: usize, col: usize },
}

/// Messages that can be sent across chains.
#[derive(Debug, Deserialize, Serialize)]
pub enum Message {
    /// Notify about a new game created
    GameCreated { game_id: u64, creator: AccountOwner },
    /// Notify about a player joining a game
    PlayerJoined { game_id: u64, player: AccountOwner },
    /// Notify about a move made
    MoveMade { 
        game_id: u64, 
        player: AccountOwner, 
        row: usize, 
        col: usize 
    },
}

/// GraphQL-compatible game representation
#[derive(SimpleObject)]
pub struct GameView {
    pub id: u64,
    pub player_x: String,
    pub player_o: Option<String>,
    pub board: Vec<Vec<Option<String>>>,
    pub current_player: String,
    pub status: String,
    pub chain_id: String,
}

impl From<(u64, &Game)> for GameView {
    fn from((id, game): (u64, &Game)) -> Self {
        let board = game.board
            .iter()
            .map(|row| {
                row.iter()
                    .map(|cell| cell.map(|p| match p {
                        Player::X => "X".to_string(),
                        Player::O => "O".to_string(),
                    }))
                    .collect()
            })
            .collect();

        let status = match &game.status {
            GameStatus::WaitingForPlayer => "Waiting for player".to_string(),
            GameStatus::InProgress => "In progress".to_string(),
            GameStatus::Won(player) => format!("Won by {}", match player {
                Player::X => "X",
                Player::O => "O",
            }),
            GameStatus::Draw => "Draw".to_string(),
        };

        Self {
            id,
            player_x: format!("{:?}", game.player_x),
            player_o: game.player_o.as_ref().map(|p| format!("{:?}", p)),
            board,
            current_player: match game.current_player {
                Player::X => "X".to_string(),
                Player::O => "O".to_string(),
            },
            status,
            chain_id: format!("{:?}", game.chain_id),
        }
    }
}

/// The application ABI.
pub struct TicTacToeAbi;

impl linera_sdk::abi::ContractAbi for TicTacToeAbi {
    type Operation = Operation;
    type Message = Message;
    type Parameters = ();
    type State = TicTacToeState;
}

impl linera_sdk::abi::ServiceAbi for TicTacToeAbi {
    type Operation = Operation;
    type Message = Message;
    type Parameters = ();
    type State = TicTacToeState;
    type Query = Request;
    type QueryResponse = Response;
}
