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

    setTimeout(() => {
      const turnMessage = { type: 'turnUpdate', currentTurn: this.currentTurn};
      const iframe1 = document.getElementById('iframe1') as HTMLIFrameElement;
      const iframe2 = document.getElementById('iframe2') as HTMLIFrameElement;
      
      if (iframe1 && iframe1.contentWindow) {
        iframe1.contentWindow.postMessage(turnMessage, '*');
      }
      if (iframe2 && iframe2.contentWindow) {
        iframe2.contentWindow.postMessage(turnMessage, '*');
      }
    }, 500);
  }
  handleMessage(event: MessageEvent): void {
    const data = event.data;

    if (data && data.type === 'turnUpdate') {
      
      return;
    }

    if (data && data.type === 'resetGame'){
      return;
    }

    
    if (data && data.checkmate) {
      alert(`Checkmate! ${data.color.toUpperCase()} wins! Click OK to reset the game.`);
      this.resetGame();
      return;
    }
    
    if (data && data.move && !data.forwarded) {
      this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
      const turnMessage = { type: 'turnUpdate', currentTurn: this.currentTurn};
      const iframe1 = document.getElementById('iframe1') as HTMLIFrameElement;
      const iframe2 = document.getElementById('iframe2') as HTMLIFrameElement;
      
      if (iframe1 && iframe1.contentWindow) {
        iframe1.contentWindow.postMessage(turnMessage, '*');
        
      }
      if (iframe2 && iframe2.contentWindow) {
        iframe2.contentWindow.postMessage(turnMessage, '*');
        
      }

      data.forwarded = true;

      const targetIframeId = data.from === 'iframe1' ? 'iframe2' : 'iframe1';

      const targetIframe = document.getElementById(targetIframeId) as HTMLIFrameElement;

      if (targetIframe && targetIframe.contentWindow) {
        targetIframe.contentWindow.postMessage(data, '*');
        
      }
      
      localStorage.setItem('gameState', JSON.stringify({
        fen: data.fen,  
        currentTurn: this.currentTurn
      }));
    }
  }

  resetGame(): void {
    const resetMessage = { type: 'resetGame' };
    const iframe1 = document.getElementById('iframe1') as HTMLIFrameElement;
    const iframe2 = document.getElementById('iframe2') as HTMLIFrameElement;
    if (iframe1 && iframe1.contentWindow) {
      iframe1.contentWindow.postMessage(resetMessage, '*');
      
    }
    if (iframe2 && iframe2.contentWindow) {
      iframe2.contentWindow.postMessage(resetMessage, '*');
      
    }
    
    this.currentTurn = 'white';
    localStorage.removeItem('gameState');
  }
}