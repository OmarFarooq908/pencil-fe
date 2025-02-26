import { Component, AfterViewInit, ViewChild, Inject, PLATFORM_ID, ChangeDetectorRef, NgZone} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxChessBoardModule, NgxChessBoardView } from 'ngx-chess-board';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-iframepage',
  standalone: true,
  imports: [NgxChessBoardModule, CommonModule], 
  templateUrl: './iframepage.component.html',
  styleUrls: ['./iframepage.component.css']
})

export class IframepageComponent implements AfterViewInit {
  @ViewChild('chessBoard', { static: false }) chessBoard!: NgxChessBoardView;
  iframeId: 'iframe1' | 'iframe2' = 'iframe1';
  isDisabled: boolean = false;
  
  private isUpdatingBoard: boolean = false;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.location.hash) {
  
      this.iframeId = window.location.hash.includes('1') ? 'iframe1' : 'iframe2';
    }
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
          this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              this.chessBoard.setFEN(state.fen);
              if (this.iframeId === 'iframe1') {
                this.isDisabled = state.currentTurn !== 'white';
              } else if (this.iframeId === 'iframe2') {
                this.isDisabled = state.currentTurn !== 'black';    
              }
              if (this.iframeId === 'iframe2'){
                this.chessBoard.reverse();
                this.cdr.detectChanges();
              }
              this.ngZone.run(() => {
              this.cdr.detectChanges();
              });
            }, 500);
          });
        }
      } else {
        setTimeout(() => {
          this.initializeComponent();
        }, 500);
      }
    }
  }

  onMoveChange(move: any): void {
    
    if (this.isUpdatingBoard) {
      return;
    }
    
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
      if (this.iframeId === 'iframe1') {
        this.isDisabled = event.data.currentTurn !== 'white';
      } else if (this.iframeId == 'iframe2') {
        this.isDisabled = event.data.currentTurn !== 'black';
      }
      this.cdr.detectChanges();
      return;
    }

    
    if (event.data && event.data.type === 'resetGame'){
      this.initializeComponent();
      return;
    }
    
    if (event.data && event.data.move && event.data.from !== this.iframeId) {
      
      this.isUpdatingBoard = true;
  
      this.chessBoard.move(event.data.move);
      
      setTimeout(() => {
        this.isUpdatingBoard = false;
      }, 100);
  
    }
  }
  initializeComponent(): void{
    this.isDisabled = (this.iframeId === 'iframe2');
    this.chessBoard.reset();

    if (this.iframeId === 'iframe2') {
      this.chessBoard.reverse();
    }

    this.cdr.detectChanges();
  }
}