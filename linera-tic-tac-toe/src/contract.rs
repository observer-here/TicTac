#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use self::state::{Game, GameStatus, TicTacToeState};
use linera_sdk::{
    base::{AccountOwner, WithContractAbi},
    Contract, ContractRuntime,
};
use tic_tac_toe::{Message, Operation, TicTacToeAbi};

pub struct TicTacToeContract;

linera_sdk::contract!(TicTacToeContract);

impl WithContractAbi for TicTacToeContract {
    type Abi = TicTacToeAbi;
}

impl Contract for TicTacToeContract {
    type Message = Message;
    type Parameters = ();
    type State = TicTacToeState;

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        TicTacToeContract
    }

    async fn instantiate(&mut self, _runtime: ContractRuntime<Self>, _argument: ()) {}

    async fn execute_operation(
        &mut self,
        runtime: ContractRuntime<Self>,
        operation: Operation,
    ) -> Self::Response {
        let owner = runtime
            .authenticated_signer()
            .expect("Missing authentication");

        match operation {
            Operation::CreateGame => {
                let mut state = runtime.state_mut().await;
                let game_id = state.next_game_id;
                let chain_id = runtime.chain_id();
                
                let game = Game::new(owner, chain_id);
                state.games.insert(game_id, game);
                state.next_game_id += 1;

                // Send cross-chain message about new game
                runtime
                    .prepare_message(Message::GameCreated {
                        game_id,
                        creator: owner,
                    })
                    .send_to_subscribers();

                log::info!("Game {} created by {:?}", game_id, owner);
            }

            Operation::JoinGame { game_id } => {
                let mut state = runtime.state_mut().await;
                
                if let Some(game) = state.games.get_mut(&game_id) {
                    match game.join(owner) {
                        Ok(()) => {
                            // Send cross-chain message about player joining
                            runtime
                                .prepare_message(Message::PlayerJoined {
                                    game_id,
                                    player: owner,
                                })
                                .send_to_subscribers();

                            log::info!("Player {:?} joined game {}", owner, game_id);
                        }
                        Err(e) => {
                            log::error!("Failed to join game {}: {}", game_id, e);
                            panic!("Failed to join game: {}", e);
                        }
                    }
                } else {
                    panic!("Game {} not found", game_id);
                }
            }

            Operation::MakeMove { game_id, row, col } => {
                let mut state = runtime.state_mut().await;
                
                if let Some(game) = state.games.get_mut(&game_id) {
                    match game.make_move(&owner, row, col) {
                        Ok(()) => {
                            // Send cross-chain message about move
                            runtime
                                .prepare_message(Message::MoveMade {
                                    game_id,
                                    player: owner,
                                    row,
                                    col,
                                })
                                .send_to_subscribers();

                            log::info!(
                                "Player {:?} made move at ({}, {}) in game {}",
                                owner, row, col, game_id
                            );

                            // Check if game ended
                            match &game.status {
                                GameStatus::Won(winner) => {
                                    log::info!("Game {} won by {:?}!", game_id, winner);
                                }
                                GameStatus::Draw => {
                                    log::info!("Game {} ended in a draw!", game_id);
                                }
                                _ => {}
                            }
                        }
                        Err(e) => {
                            log::error!("Failed to make move in game {}: {}", game_id, e);
                            panic!("Failed to make move: {}", e);
                        }
                    }
                } else {
                    panic!("Game {} not found", game_id);
                }
            }
        }
    }

    async fn execute_message(
        &mut self,
        runtime: ContractRuntime<Self>,
        message: Message,
    ) {
        log::info!("Received message: {:?}", message);
        
        match message {
            Message::GameCreated { game_id, creator } => {
                log::info!("Game {} was created by {:?}", game_id, creator);
            }
            Message::PlayerJoined { game_id, player } => {
                log::info!("Player {:?} joined game {}", player, game_id);
            }
            Message::MoveMade { game_id, player, row, col } => {
                log::info!(
                    "Player {:?} made move at ({}, {}) in game {}",
                    player, row, col, game_id
                );
            }
        }
    }
}
