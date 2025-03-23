import { Chess } from 'chess.js';
import { WebSocket } from 'ws';
import { GAME_OVER, INIT_GAME, MAKE_MOVE } from './messages';

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  public board: Chess;
  private startTime: Date;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: 'white'
        }
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: 'black'
        }
      })
    );
  }

  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
      promotion?: string;
    }
  ) {
    // validation here
    if (socket !== this.player1 && socket !== this.player2) {
      return;
    }
    if (this.board.turn() === 'w' && socket !== this.player1) {
      return;
    }
    if (this.board.turn() === 'b' && socket !== this.player2) {
      return;
    }

    try {
      try {
        this.board.move(move);
      } catch (e: any) {
        console.error(e?.message || e);
        return;
      }

      if (this.board.isGameOver()) {
        // send the game over message to both players
        this.player1.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner: this.board.turn() === 'w' ? 'black' : 'white',
              duration: new Date().getTime() - this.startTime.getTime()
            }
          })
        );
        this.player2.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner: this.board.turn() === 'w' ? 'black' : 'white',
              duration: new Date().getTime() - this.startTime.getTime()
            }
          })
        );
      }

      if (this.board.turn() === 'w') {
        this.player1.send(
          JSON.stringify({
            type: MAKE_MOVE,
            payload: move
          })
        );
      } else {
        this.player2.send(
          JSON.stringify({
            type: MAKE_MOVE,
            payload: move
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
}
