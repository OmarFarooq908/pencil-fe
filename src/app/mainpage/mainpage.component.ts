import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css']
})
export class MainpageComponent implements OnInit {
  currentTurn: 'white' | 'black' = 'white';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }
  handleMessage(event: MessageEvent): void {
    const data = event.data;
    if (data && data.move) {
      // Toggle turn or perform other logic here
      this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
      // Forward move logic here, for example:
      const targetIframeId = data.from === 'iframe1' ? 'iframe2' : 'iframe1';
      const targetIframe = document.getElementById(targetIframeId) as HTMLIFrameElement;
      if (targetIframe && targetIframe.contentWindow) {
        targetIframe.contentWindow.postMessage(data, '*');
      }
      // Save state if needed.
      localStorage.setItem('gameState', JSON.stringify({
        fen: 'current_FEN_string',  // update with your actual FEN state
        currentTurn: this.currentTurn
      }));
    }
  }
}
