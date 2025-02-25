import { Component, AfterViewInit, ViewChild, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxChessBoardModule, NgxChessBoardView } from 'ngx-chess-board';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-iframepage',
  standalone: true,
  imports: [NgxChessBoardModule, CommonModule], // <-- Add this line
  templateUrl: './iframepage.component.html',
  styleUrls: ['./iframepage.component.css']
})
export class IframepageComponent implements AfterViewInit {
  @ViewChild('chessBoard', { static: false }) chessBoard!: NgxChessBoardView;
  iframeId: 'iframe1' | 'iframe2' = 'iframe1';
  isDisabled: boolean = false;

  // Flag to ignore moveChange events triggered by programmatic updates.
  private isUpdatingBoard: boolean = false;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {


    
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.location.hash) {
  
      this.iframeId = window.location.hash.includes('1') ? 'iframe1' : 'iframe2';
    }
    // Set initial disabled state: disable if this iframe is for black (iframe2)
    this.isDisabled = (this.iframeId === 'iframe2');

  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('message', this.receiveMessage.bind(this));
      
      const gameState = localStorage.getItem('gameState');
  
      if (this.iframeId === 'iframe2'){
        this.chessBoard.reverse();
        this.cdr.detectChanges();
    
    
    
      }
      if (gameState) {
        const state = JSON.parse(gameState);
        if (state.fen) {
          // Run the board update outside Angular's zone and then re-enter to trigger change detection
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              this.chessBoard.setFEN(state.fen);
              
              // Update isDisabled based on the saved current turn.
              if (this.iframeId === 'iframe1') {
                this.isDisabled = state.currentTurn !== 'white';
            
            
            
            
            
              } else if (this.iframeId === 'iframe2') {
                this.isDisabled = state.currentTurn !== 'black';
                
              }
              if (this.iframeId === 'iframe2'){
                this.chessBoard.reverse();
                this.cdr.detectChanges();
            
            
            
              }
              // Now re-enter Angular zone and run change detection
              this.ngZone.run(() => {
              this.cdr.detectChanges();
              });
            }, 500);
          });
        }
      } else {
          // Force the board to initialize properly
        setTimeout(() => {
          // this.chessBoard.reset();
          this.initializeComponent();
        }, 500);
      }
    }
  }

  onMoveChange(move: any): void {
    // If we're in the middle of a programmatic update, ignore this event.
    if (this.isUpdatingBoard) {
  
      return;
    }
    // If this board is disabled, ignore move events
    if (this.isDisabled) {
  
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const moveString = `${move.from}${move.to}`;
      const message = { ...move, from: this.iframeId };
      window.parent.postMessage(message, '*');
  
  
    }
  }

  receiveMessage(event: MessageEvent): void {



    if (event.data && event.data.type == 'turnUpdate') {
      // Set isDisabled based on whose turn it is
      // For iframe1 (white), enable if currentTurn is 'white'

      if (this.iframeId === 'iframe1') {
        this.isDisabled = event.data.currentTurn !== 'white';
      } else if (this.iframeId == 'iframe2') {
        this.isDisabled = event.data.currentTurn !== 'black';
      }
  
      this.cdr.detectChanges();
      return;
    }

    // Handle resetGame message.
    if (event.data && event.data.type === 'resetGame'){
  
      // this.chessBoard.reset();
      this.initializeComponent();
      // Optionally reset any local state.
      return;
    }
    // Process move messages that did not originate from this iframe.
    if (event.data && event.data.move && event.data.from !== this.iframeId) {
      // Set flag to ignore subsequent moveChange events triggered by programmatic update.
      this.isUpdatingBoard = true;
  
      this.chessBoard.move(event.data.move);
      // Delay resetting the flag until after change detection
      setTimeout(() => {
        this.isUpdatingBoard = false;
      }, 100);
  
    }
  }
  initializeComponent(): void{
    // Reset any local state variables to defaults.
    // set isDisabled based on iframe's identity:
    this.isDisabled = (this.iframeId === 'iframe2');

    // Reset the chess board to the starting position.
    this.chessBoard.reset();

    if (this.iframeId === 'iframe2') {
      this.chessBoard.reverse();
    }

    this.cdr.detectChanges();


  }
}