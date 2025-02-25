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

    console.log(" PlatformId: ", this.platformId);
    //console.log(" window.location.hash: ", window.location.hash);
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.location.hash) {
      console.log("Window location hash:", window.location.hash);
      this.iframeId = window.location.hash.includes('1') ? 'iframe1' : 'iframe2';
    }
    // Set initial disabled state: disable if this iframe is for black (iframe2)
    this.isDisabled = (this.iframeId === 'iframe2');
    console.log("Iframe initialized with id:", this.iframeId);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('message', this.receiveMessage.bind(this));
      // Force the board to initialize properly
      setTimeout(() => {
        this.chessBoard.reset();
        
        // For frame2 (black), reverse the board's internal logic
        if (this.iframeId === 'iframe2') {
          // Delay reverse() slightly to ensure the board is rendered
        setTimeout(() => {
          this.chessBoard.reverse();
          this.cdr.detectChanges();
          console.log("Reverse() applied on iframe2");
        }, 100);
        }
        this.cdr.detectChanges();
      }, 0);
      const gameState = localStorage.getItem('gameState');
      if (gameState) {
        const state = JSON.parse(gameState);
        if (state.fen) {
          // Run the board update outside Angular's zone and then re-enter to trigger change detection
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              this.chessBoard.setFEN(state.fen);
              // Now re-enter Angular zone and run change detection
              this.ngZone.run(() => {
                this.cdr.detectChanges();
              });
            }, 0);
          });
        }
      }
    }
  }

  onMoveChange(move: any): void {
    // If we're in the middle of a programmatic update, ignore this event.
    if (this.isUpdatingBoard) {
      console.log(`Iframe ${this.iframeId}: Ignoring moveChange during programmatic update`);
      return;
    }
    // If this board is disabled, ignore move events
    if (this.isDisabled) {
      console.log(`Iframe ${this.iframeId} is disabled. Ignoring move.`);
      return;
    }
    console.log(" >> onMoveChange ran >> ", this.platformId)
    if (isPlatformBrowser(this.platformId)) {
      const moveString = `${move.from}${move.to}`;
      const message = { ...move, from: this.iframeId };
      window.parent.postMessage(message, '*');
      console.log(" >> noMoveChange isPlatformBrowser ran >> ", moveString);
      console.log(" >> The move object >> ", move);
    }
  }

  receiveMessage(event: MessageEvent): void {
    console.log("ReceiveMessage ran >> ", event.data)
    console.log("ReceveMessage frameId >> ", this.iframeId);

    if (event.data && event.data.type == 'turnUpdate') {
      // Set isDisabled based on whose turn it is
      // For iframe1 (white), enable if currentTurn is 'white'

      if (this.iframeId === 'iframe1') {
        this.isDisabled = event.data.currentTurn !== 'white';
      } else if (this.iframeId == 'iframe2') {
        this.isDisabled = event.data.currentTurn !== 'black';
      }
      console.log(`Iframe ${this.iframeId} is now ${this.isDisabled ? 'disabled' : 'enabled'}`);
      this.cdr.detectChanges();
      return;
    }
    if (event.data && event.data.move && event.data.from !== this.iframeId) {
      // Set flag to ignore subsequent moveChange events triggered by programmatic update.
      this.isUpdatingBoard = true;
      console.log(`Iframe ${this.iframeId} applying move:`, event.data.move);
      this.chessBoard.move(event.data.move);
      // Delay resetting the flag until after change detection
      setTimeout(() => {
        this.isUpdatingBoard = false;
      }, 100);
      console.log("Move applied:", event.data.move);
    }
  }
}