import { ChangeDetectorRef, Component, inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { getDatabase, ref, onValue, update, Database } from '@angular/fire/database';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { NgxChessBoardModule, NgxChessBoardView } from 'ngx-chess-board';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-online-game',
  standalone: true,
  imports: [
    NgxChessBoardModule,
    CommonModule
  ],
  templateUrl: './online-game.component.html',
  styleUrl: './online-game.component.css'
})
export class OnlineGameComponent implements OnInit {
  @ViewChild('chessboard', {static: false}) chessBoard!: NgxChessBoardView;

  // Game state variables.
  gameCode: string = '';
  gameState$: Observable<any> | undefined;
  currentTurn: 'white' | 'black' = 'white';
  playerColor: 'white' | 'black' = 'white'; // Creator is white by default.
  gameStarted: boolean = false;
  isMyTurn: boolean = false;

  db: Database = inject(Database);
  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Optionally, resume a game if data is saved in localStorage.
    const savedGame = localStorage.getItem('onlineGame');
    if (savedGame) {
      const game = JSON.parse(savedGame);
      this.gameCode = game.gameCode;
      this.playerColor = game.playerColor;
      this.subscribeToGame();
      this.gameStarted = true;
    }
  }

  /**
   * Creates a new game.
   */
  createGame(): void {
    // Push a new game node to Firebase with the initial state.
    const gameRef = ref(this.db, `/games/${Date.now()}`);
    this.gameCode = gameRef.key as string;
    this.playerColor = 'white'; // Creator is white.
    localStorage.setItem('onlineGame', JSON.stringify({ gameCode: this.gameCode, playerColor: this.playerColor}));
    this.subscribeToGame();
    alert(`Game created! Share this game code with your friend: ${this.gameCode}`);
  }

  /**
   * Join an existing game by code.
   */
  joinGame(code: string): void {
    this.gameCode = code;
    // Assume joinning a player is black
    this.playerColor = 'black';
    localStorage.setItem('onlineGame', JSON.stringify({ gameCode: this.gameCode, playerColor: this.playerColor }));
    this.subscribeToGame();
    this.gameStarted = true;
  }

  /**
   * Subscribes to changes in the game state from Firebase.
   */
  subscribeToGame(): void {
    const gameRef = ref(this.db, `/games/${this.gameCode}`);
    onValue(gameRef, snapshot => {
      const state = snapshot.val();
      if (state) {
        this.currentTurn = state.currentTurn;
        // Update the chess board with the saved FEN.
        if (this.chessBoard) {
          // Run outside Angular to minimize change detection overhead.
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              this.chessBoard.setFEN(state.fen);
              this.ngZone.run(() => {
                this.cdr.detectChanges();
              });
            }, 0);
          });
        }
        // Determine if it is this player's turn.
        this.isMyTurn = (this.playerColor === state.currentTurn);
      }
    });
  }
  onMoveChange(move: any): void {
    if (!this.isMyTurn) {
      // Ignore moves if it is not this player's turn.
      return;
    }
    // For this example, we assume the move event gives a move string like "e2e4".
    const moveString = move.move || `${move.from}${move.to}`;
    // After a move, update the board state by reading the new FEN.
    const newFen = this.chessBoard.getFEN();
    const newTurn: 'white' | 'black' = this.currentTurn === 'white' ? 'black' : 'white';
    // Update Firebase with the new FEN and current turn.
    const gameRef = ref(this.db, `/games/${this.gameCode}`);
    update(gameRef, {
      fen: newFen,
      currentTurn: newTurn
    });
  }

  /**
   * Resets the online game to its initial state.
   */
  resetGame(): void {
    const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    const gameRef = ref(this.db, `/games/${this.gameCode}`);
    update(gameRef, {
      fen: initialFen,
      currentTurn: 'white'
    });
  }
}
