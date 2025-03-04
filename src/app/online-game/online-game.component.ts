import { ChangeDetectorRef, Component, Inject, inject, NgZone, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { getDatabase, ref, onValue, update, Database } from '@angular/fire/database';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { NgxChessBoardModule, NgxChessBoardView } from 'ngx-chess-board';
import { CommonModule, isPlatformBrowser, JsonPipe } from '@angular/common';
import { getApp, getApps, initializeApp } from 'firebase/app';

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
  @ViewChild('chessBoard', {static: false}) chessBoard!: NgxChessBoardView;

  gameCode: string = '';
  gameState$: Observable<any> | undefined;
  currentTurn: 'white' | 'black' = 'white';
  playerColor: 'white' | 'black' = 'white'; 
  gameStarted: boolean = false;
  isMyTurn: boolean = false;

  db!: Database;
  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    
    console.log('OnlineGameComponent constructor called.');
    console.log('isPlatformBrowser:', isPlatformBrowser(this.platformId));
    if (isPlatformBrowser(this.platformId)) {
      const apps = getApps();
      console.log('Existing Firebase apps:', apps);
      if (apps.length === 0) {
        initializeApp(environment.firebaseConfig);
        console.log('Firebase app initialized in OnlineGameComponent constructor.');
      }
      this.db = getDatabase();
      console.log('Database instance:', this.db);
    } else {
      console.warn('Not running in a browser. Firebase and localStorage will not be available.');
    }
  }

  ngOnInit(): void {
    
    if (isPlatformBrowser(this.platformId)) {
      const savedGame = localStorage.getItem('onlineGame');
      console.log('Saved game from localStorage:', savedGame);
      if (savedGame) {
        const game = JSON.parse(savedGame);
        this.gameCode = game.gameCode;
        this.playerColor = game.playerColor;
        console.log('Resuming game with code:', this.gameCode, 'and playerColor:', this.playerColor);
        this.subscribeToGame();
        this.gameStarted = true;
      } else {
        console.log('No saved game found.');
      }
    }
  }

  createGame(): void {
    
    if (!isPlatformBrowser(this.platformId)) {
      console.error('Cannot create game: not running in a browser.');
      return;
    }
    const newGameId = Date.now().toString();
    const gameRef = ref(this.db, `/games/${newGameId}`);
    update(gameRef, {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
      currentTurn: 'white'
    }).then(() => {
      console.log('Game node created in Firebase with ID:', newGameId);
    }).catch(err => console.error('Error creating game:', err));
    this.gameCode = gameRef.key as string;
    this.playerColor = 'white'; 
    localStorage.setItem('onlineGame', JSON.stringify({ gameCode: this.gameCode, playerColor: this.playerColor }));
    console.log('Game created with code:', this.gameCode);
    this.subscribeToGame();
    this.gameStarted = true;
    alert(`Game created! Share this game code with your friend: ${this.gameCode}`);
  }

  joinGame(code: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('Cannot join game: not running in a browser.');
      return;
    }
    this.gameCode = code;
    this.playerColor = 'black'; 
    localStorage.setItem('onlineGame', JSON.stringify({ gameCode: this.gameCode, playerColor: this.playerColor }));
    console.log('Joined game with code:', this.gameCode, 'as player:', this.playerColor);
    this.subscribeToGame();
    this.gameStarted = true;
  }

  subscribeToGame(): void {
    console.log('Subscribing to game state for gameCode:', this.gameCode);
    const gameRef = ref(this.db, `/games/${this.gameCode}`);
    onValue(gameRef, snapshot => {
      const state = snapshot.val();
      console.log('Firebase game state updated:', state);
      if (state) {
        this.currentTurn = state.currentTurn;
        console.log('Current turn from Firebase:', state.currentTurn, '| PlayerColor:', this.playerColor);
        if (this.chessBoard) {
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              console.log('Setting FEN on chess board:', state.fen);
              this.chessBoard.setFEN(state.fen);
              this.ngZone.run(() => {
                this.cdr.detectChanges();
              });
            }, 0);
          });
        }  else {
          console.warn('Chess board reference is not available yet.');
        }
        this.isMyTurn = (this.playerColor === state.currentTurn);
        console.log(`It is now ${state.currentTurn}'s turn. Is it my turn?`, this.isMyTurn);
      }
    });
  }
  onMoveChange(move: any): void {
    console.log('onMoveChange called. isMyTurn:', this.isMyTurn, 
      'playerColor:', this.playerColor, 
      'currentTurn:', this.currentTurn,
      'move:', move);
    if (!this.chessBoard) {
      console.error('Chess board is not available yet.');
      return;
    }
    if (!this.isMyTurn) {
      console.log('Not my turn. Move ignored.');
      return;
    }

    
  if (move.color) {
    if (move.color !== this.playerColor) {
      console.warn(`Move color (${move.color}) does not match playerColor (${this.playerColor}). Move ignored.`);
      return;
    }
  } else {
    
    console.warn('Move event does not include a color property.');
    
    
  }
    const moveString = move.move || `${move.from}${move.to}`;
    console.log('Move made:', moveString);
    const newFen = this.chessBoard.getFEN();
    const newTurn: 'white' | 'black' = this.currentTurn === 'white' ? 'black' : 'white';
    console.log('Updating game state with new FEN:', newFen, 'and new turn:', newTurn);
    const gameRef = ref(this.db, `/games/${this.gameCode}`);
    update(gameRef, {
      fen: newFen,
      currentTurn: newTurn
    }).then(() => {
      console.log('Game state updated in Firebase.');
    }).catch(err => {
      console.error('Error updating game state:', err);
    });
  }
  
  resetGame(): void {
    const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    console.log('Resetting game to initial state with FEN:', initialFen);
    const gameRef = ref(this.db, `/games/${this.gameCode}`);
    update(gameRef, {
      fen: initialFen,
      currentTurn: 'white'
    }).then(() => {
      console.log('Game reset successfully.');
    }).catch(err => {
      console.error('Error resetting game:', err);
    });
  }

  leaveGame(): void {
    console.log('Leaving game. Clearing game state...');
    localStorage.removeItem('onlineGame');
    this.gameCode = '';
    this.gameStarted = false;
    this.currentTurn = 'white';
    this.playerColor = 'white';
    this.isMyTurn = false;
    this.cdr.detectChanges();
    console.log('Left game successfully. State reset.');
  }
  
}
