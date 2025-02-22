import { Component, AfterViewInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxChessBoardModule, NgxChessBoardView } from 'ngx-chess-board';

@Component({
  selector: 'app-iframepage',
  standalone: true,
  imports: [NgxChessBoardModule], // <-- Add this line
  templateUrl: './iframepage.component.html',
  styleUrls: ['./iframepage.component.css']
})
export class IframepageComponent implements AfterViewInit {
  @ViewChild('chessBoard', { static: false }) chessBoard!: NgxChessBoardView;
  iframeId: 'iframe1' | 'iframe2' = 'iframe1';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId) && window.location.hash) {
      this.iframeId = window.location.hash.includes('1') ? 'iframe1' : 'iframe2';
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('message', this.receiveMessage.bind(this));
      const gameState = localStorage.getItem('gameState');
      if (gameState) {
        const state = JSON.parse(gameState);
        if (state.fen) {
          this.chessBoard.setFEN(state.fen);
        }
      }
    }
  }

  onMoveChange(move: any): void {
    if (isPlatformBrowser(this.platformId)) {
      const moveString = `${move.from}${move.to}`;
      const message = { move: moveString, from: this.iframeId };
      window.parent.postMessage(message, '*');
    }
  }

  receiveMessage(event: MessageEvent): void {
    if (event.data && event.data.move && event.data.from !== this.iframeId) {
      this.chessBoard.move(event.data.move);
    }
  }
}