#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{
    Context, EmptySubscription, Object, Request, Response, Schema, SimpleObject,
};
use linera_sdk::{
    base::WithServiceAbi,
    Service, ServiceRuntime,
};
use tic_tac_toe::{GameView, Message, Operation, TicTacToeAbi, TicTacToeState};

pub struct TicTacToeService {
    state: Arc<TicTacToeState>,
}

linera_sdk::service!(TicTacToeService);

impl WithServiceAbi for TicTacToeService {
    type Abi = TicTacToeAbi;
}

impl Service for TicTacToeService {
    type Parameters = ();
    type State = TicTacToeState;

    async fn load(runtime: ServiceRuntime<Self>) -> Self {
        let state = runtime.state().await;
        Self {
            state: Arc::new(state),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot {
                state: self.state.clone(),
            },
            MutationRoot {},
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

struct QueryRoot {
    state: Arc<TicTacToeState>,
}

#[Object]
impl QueryRoot {
    /// Get all games
    async fn games(&self) -> Vec<GameView> {
        self.state
            .games
            .iter()
            .map(|(id, game)| GameView::from((*id, game)))
            .collect()
    }

    /// Get a specific game by ID
    async fn game(&self, id: u64) -> Option<GameView> {
        self.state
            .games
            .get(&id)
            .map(|game| GameView::from((id, game)))
    }

    /// Get games where a specific player is participating
    async fn games_for_player(&self, player: String) -> Vec<GameView> {
        self.state
            .games
            .iter()
            .filter(|(_, game)| {
                format!("{:?}", game.player_x) == player
                    || game.player_o.as_ref().map(|p| format!("{:?}", p)) == Some(player.clone())
            })
            .map(|(id, game)| GameView::from((*id, game)))
            .collect()
    }

    /// Get games waiting for a second player
    async fn waiting_games(&self) -> Vec<GameView> {
        self.state
            .games
            .iter()
            .filter(|(_, game)| matches!(game.status, state::GameStatus::WaitingForPlayer))
            .map(|(id, game)| GameView::from((*id, game)))
            .collect()
    }

    /// Get active games (in progress)
    async fn active_games(&self) -> Vec<GameView> {
        self.state
            .games
            .iter()
            .filter(|(_, game)| matches!(game.status, state::GameStatus::InProgress))
            .map(|(id, game)| GameView::from((*id, game)))
            .collect()
    }

    /// Get completed games
    async fn completed_games(&self) -> Vec<GameView> {
        self.state
            .games
            .iter()
            .filter(|(_, game)| {
                matches!(
                    game.status,
                    state::GameStatus::Won(_) | state::GameStatus::Draw
                )
            })
            .map(|(id, game)| GameView::from((*id, game)))
            .collect()
    }

    /// Get statistics about all games
    async fn stats(&self) -> GameStats {
        let total_games = self.state.games.len() as u64;
        let waiting_games = self
            .state
            .games
            .values()
            .filter(|game| matches!(game.status, state::GameStatus::WaitingForPlayer))
            .count() as u64;
        let active_games = self
            .state
            .games
            .values()
            .filter(|game| matches!(game.status, state::GameStatus::InProgress))
            .count() as u64;
        let completed_games = self
            .state
            .games
            .values()
            .filter(|game| {
                matches!(
                    game.status,
                    state::GameStatus::Won(_) | state::GameStatus::Draw
                )
            })
            .count() as u64;

        GameStats {
            total_games,
            waiting_games,
            active_games,
            completed_games,
        }
    }
}

struct MutationRoot;

#[Object]
impl MutationRoot {
    /// Create a new game
    async fn create_game(&self, _context: &Context<'_>) -> String {
        "Use the operation interface to create games".to_string()
    }

    /// Join an existing game
    async fn join_game(&self, _context: &Context<'_>, _game_id: u64) -> String {
        "Use the operation interface to join games".to_string()
    }

    /// Make a move in a game
    async fn make_move(
        &self,
        _context: &Context<'_>,
        _game_id: u64,
        _row: i32,
        _col: i32,
    ) -> String {
        "Use the operation interface to make moves".to_string()
    }
}

/// Statistics about the tic-tac-toe application
#[derive(SimpleObject)]
pub struct GameStats {
    pub total_games: u64,
    pub waiting_games: u64,
    pub active_games: u64,
    pub completed_games: u64,
}
