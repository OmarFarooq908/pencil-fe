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
      console.log("Broadcasting initial turn update:", turnMessage);
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
      console.log("Parent received a turnUpdate message; ignoring:", data);
      return;
    }

    // Process only original move messages (not forwarded ones).
    if (data && data.move && !data.forwarded) {
      // Toggle turn or perform other logic here
      console.log("Parent received original move from", data.from, "with move:", data.move);
      console.log("Current turn BEFORE toggle:", this.currentTurn);
    
      this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';

      console.log("Current turn AFTER toggle:", this.currentTurn);

      // Broadcast the new turn to both iframes
      const turnMessage = { type: 'turnUpdate', currentTurn: this.currentTurn};
      const iframe1 = document.getElementById('iframe1') as HTMLIFrameElement;
      const iframe2 = document.getElementById('iframe2') as HTMLIFrameElement;
      console.log("Turn Message: ", turnMessage);
      if (iframe1 && iframe1.contentWindow) {
        iframe1.contentWindow.postMessage(turnMessage, '*');
        console.log("Sent turn update to iframe1:", turnMessage);
      }
      if (iframe2 && iframe2.contentWindow) {
        iframe2.contentWindow.postMessage(turnMessage, '*');
        console.log("Sent turn update to iframe2:", turnMessage);
      }

      // Mark this message as forwarded so it is not processed again
      data.forwarded = true;
      
      // Forward move logic here, for example:
      const targetIframeId = data.from === 'iframe1' ? 'iframe2' : 'iframe1';
      
      console.log("This is the target frame ID >> ", targetIframeId);
      const targetIframe = document.getElementById(targetIframeId) as HTMLIFrameElement;
      console.log(" >> This is the target frame name >> ", targetIframe)
      console.log(" >> This is the move >> ", data.move)
      if (targetIframe && targetIframe.contentWindow) {
        targetIframe.contentWindow.postMessage(data, '*');
        console.log("Forwarded move to ", targetIframeId);
      }
      // Save state if needed.
      localStorage.setItem('gameState', JSON.stringify({
        fen: 'current_FEN_string',  // update with your actual FEN state
        currentTurn: this.currentTurn
      }));
    }
  }
}
