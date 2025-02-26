# Pencil FE Assignment

[![Angular 16](https://img.shields.io/badge/Angular-16-red)](https://angular.io/) [![Firebase](https://img.shields.io/badge/Firebase-Realtime%20Database-blue)](https://firebase.google.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Pencil FE Assignment is a feature-rich Angular 16 application that simulates a chess match in two modes:

- **Offline Mode:** Two iframes—each representing one player (white and black)—communicate via the `postMessage` API. The game uses the [ngx-chess-board](https://www.npmjs.com/package/ngx-chess-board) library with real-time move replication, turn-based control, and local storage persistence.
- **Online Mode (Bonus Feature):** A single-board online game powered by Firebase's Realtime Database. Players can create a new game or join an existing game using a unique game code. Moves are synchronized across sessions in real time.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Firebase Integration](#firebase-integration)
- [Running the Application](#running-the-application)
- [Testing the Online Mode](#testing-the-online-mode)
- [Deployment](#deployment)
- [Debugging & Logs](#debugging--logs)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Dual Mode Chess Game:**  
  - **Offline Mode:** Two iframes are used—one for white and one for black. The main page mediates moves between the iframes via the `postMessage` API.
  - **Online Mode:** A single-board view is synchronized via Firebase Realtime Database. Players can create a game (assigned white) or join an existing game (assigned black).

- **Turn-Based Interaction:**  
  The system enforces turns:
  - The active board is enabled (with an overlay displayed on the inactive board).
  - Moves are only accepted when it’s the player’s turn.

- **Realtime Updates & Persistence:**  
  - Moves are immediately synchronized using Firebase.
  - Game state (FEN and current turn) is stored in local storage, allowing resumption of an unfinished game.

- **Game Controls:**  
  - **Reset Game:** A button resets the game to the starting position.
  - **Leave Game:** A button lets the user exit the game, clearing local storage and local state.

- **Responsive Debug Logging:**  
  Detailed console logs help trace Firebase initialization, game state updates, and move validations.

---

## Project Structure

```
pencil-fe-assignment/
├── node_modules/                
├── public/                      # Static assets (e.g., favicon)
├── src/
│   ├── app/
│   │   ├── app.component.*      # Root component (layout, header)
│   │   ├── app.module.ts        # NgModule configuration
│   │   ├── app.routes.ts        # Application routes
│   │   ├── iframepage/          # Offline mode iframe component
│   │   │   ├── iframepage.component.ts
│   │   │   ├── iframepage.component.html
│   │   │   └── iframepage.component.css
│   │   ├── mainpage/            # Main page hosting iframes
│   │   │   ├── mainpage.component.ts
│   │   │   ├── mainpage.component.html
│   │   │   └── mainpage.component.css
│   │   └── online-game/         # Online game mode component
│   │       ├── online-game.component.ts
│   │       ├── online-game.component.html
│   │       └── online-game.component.css
│   ├── environments/
│   │   ├── environment.ts       # Firebase config, etc.
│   │   └── environment.prod.ts
│   ├── index.html
│   ├── main.ts                  # Application bootstrap with Firebase providers
│   └── styles.css               # Global styles
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Installation & Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/omarfarooq908/pencil-fe-assignment.git
   cd pencil-fe-assignment
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **(Optional) Install Angular CLI Globally:**

   ```bash
   npm install -g @angular/cli
   ```

---

## Firebase Integration

1. **Set Up Firebase:**  
   - Create a project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable Firebase Realtime Database (or Firestore if you later choose to use it).

2. **Configure Firebase:**  
   Copy your Firebase configuration from the Firebase Console and paste it into your `src/environments/environment.ts` file. For example:

   ```typescript
   export const environment = {
     production: false,
     firebaseConfig: {
       apiKey: "[apikey]",
       authDomain: "[authDomain]",
       databaseURL: "[databaseURL]",
       projectId: "[projectId]",
       storageBucket: "[storageBucket]",
       messagingSenderId: "[messagingSenderId]",
       appId: "[appId]",
       measurementId: "[measurementId]"
     }
   };
   ```

3. **Initialize Firebase:**  
   In your `src/main.ts`, Firebase is initialized using AngularFire’s modular providers:

   ```typescript
   import { bootstrapApplication } from '@angular/platform-browser';
   import { provideRouter } from '@angular/router';
   import { importProvidersFrom } from '@angular/core';
   import { BrowserModule } from '@angular/platform-browser';
   import { NgxChessBoardModule } from 'ngx-chess-board';
   import { AppComponent } from './app/app.component';
   import { routes } from './app/app.routes';
   import { environment } from './environments/environment';
   import { provideFirebaseApp } from '@angular/fire/app';
   import { initializeApp } from 'firebase/app';
   import { getDatabase, provideDatabase } from '@angular/fire/database';

   bootstrapApplication(AppComponent, {
     providers: [
       provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
       provideDatabase(() => getDatabase()),
       importProvidersFrom(BrowserModule, NgxChessBoardModule.forRoot()),
       provideRouter(routes)
     ]
   }).catch(err => console.error(err));
   ```

---

## Running the Application

Run the development server:

```bash
ng serve
```

- The **Main Page** (`/mainpage`) hosts two iframes for offline play.
- The **Online Game Mode** is available at `/online-game`.

---

## Testing the Online Mode

1. **Simulate Two Players:**  
   - Open one browser window (or tab) as the game creator (Player 1, white).
   - Open a separate incognito window (or another browser) for the joining player (Player 2, black).

2. **Create a Game:**  
   In the creator’s session, click "Create New Game." The game code will be generated and displayed.

3. **Join a Game:**  
   In the other session, navigate to `/online-game`, enter the game code, and click "Join Game."

4. **Gameplay:**  
   - The board state (FEN and turn) is synchronized via Firebase.
   - An overlay displays "Waiting for opponent..." on the inactive board.
   - Debug logs in the console will show the current turn, playerColor, and move events.

---

## Demo
[Demo video](https://www.loom.com/share/089715eae50340a1a1e5d0f253fd9403?sid=8aadc7c8-ee8e-49c4-8a66-adeee953bbd2).

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Enjoy the game and happy coding!*
