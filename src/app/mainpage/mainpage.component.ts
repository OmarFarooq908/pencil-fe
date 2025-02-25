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

    // Broadcast the intial turn update after a short delay to let the frames load.
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

    // Ignore turnUpdate messages in this handler.
    if (data && data.type === 'turnUpdate') {
      
      return;
    }

    if (data && data.type === 'resetGame'){
      return;
    }

    // Check for checkmate: if the move indicates checkmate, alert the user and reset the game.
    if (data && data.checkmate) {
      alert(`Checkmate! ${data.color.toUpperCase()} wins! Click OK to reset the game.`);
      this.resetGame();
      return;
    }
    // Process only original move messages (not forwarded ones).
    if (data && data.move && !data.forwarded) {
      // Toggle turn or perform other logic here
      
      
    
      this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';

      

      // Broadcast the new turn to both iframes
      const turnMessage = { type: 'turnUpdate', currentTurn: this.currentTurn};
      const iframe1 = document.getElementById('iframe1') as HTMLIFrameElement;
      const iframe2 = document.getElementById('iframe2') as HTMLIFrameElement;
      
      if (iframe1 && iframe1.contentWindow) {
        iframe1.contentWindow.postMessage(turnMessage, '*');
        
      }
      if (iframe2 && iframe2.contentWindow) {
        iframe2.contentWindow.postMessage(turnMessage, '*');
        
      }

      // Mark this message as forwarded so it is not processed again
      data.forwarded = true;
      
      // Forward move logic here, for example:
      const targetIframeId = data.from === 'iframe1' ? 'iframe2' : 'iframe1';
      
      
      const targetIframe = document.getElementById(targetIframeId) as HTMLIFrameElement;
      
      
      if (targetIframe && targetIframe.contentWindow) {
        targetIframe.contentWindow.postMessage(data, '*');
        
      }
      // Save state if needed.
      localStorage.setItem('gameState', JSON.stringify({
        fen: data.fen,  // use the FEN value from the move event
        currentTurn: this.currentTurn
      }));
    }
  }

  // New method: resetGame()
  // This method broadcasts a reset message to both iframes and resets any parent state
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
    // Optionally reset the parent's game state.
    this.currentTurn = 'white';
    localStorage.removeItem('gameState');
  }
}