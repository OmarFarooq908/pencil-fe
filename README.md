# Pencil FE Assignment

![Angular](https://img.shields.io/badge/Angular-16-red)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

Pencil FE Assignment is a feature-rich Angular 16 application that simulates a chess match using two iframes—each representing one player. One iframe is dedicated to the white player and the other to the black player. The application leverages the [ngx-chess-board](https://www.npmjs.com/package/ngx-chess-board) library (v2.2.3) and uses the postMessage API for real-time communication between the iframes through a parent window. The project persists game state using LocalStorage and includes checkmate detection with a game reset functionality.

> **Note:** The online game functionality is not yet implemented.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Communication Model](#communication-model)
- [Game State & Persistence](#game-state--persistence)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Dual Iframe Setup:**  
  Two iframes simulate a two-player chess match:
  - **Player 1 (White):** Iframe1 is enabled by default.
  - **Player 2 (Black):** Iframe2 is rotated for the correct perspective and disabled initially.

- **Turn-Based Interaction:**  
  Only the active player’s board is enabled. When one player makes a move, the parent toggles the turn and forwards the move to the other iframe.

- **Real-Time Move Synchronization:**  
  Moves are captured via the postMessage API, processed by the parent, and forwarded to the opposite iframe in real time.

- **Checkmate Detection:**  
  The application detects checkmate and presents an alert with the winning player, offering a reset option to restart the game.

- **Game State Persistence:**  
  The current game state (board position using FEN, current turn, etc.) is stored in LocalStorage so that the game can be resumed if the user closes the browser.

- **Reset Game Functionality:**  
  A reset button is provided to restart the game manually.

- **Online Game Functionality:**  
  _Not yet implemented._

---

## Project Structure

```
pencil-fe-assignment/
├── node_modules/                # Installed npm packages
├── public/                      # Public assets (if any)
├── src/
│   ├── app/
│   │   ├── app.component.*      # Root component for overall layout and header
│   │   ├── app.routes.ts        # Application routing configuration
│   │   ├── mainpage/            # Main page container (parent window hosting iframes)
│   │   │   ├── mainpage.component.ts
│   │   │   ├── mainpage.component.html
│   │   │   └── mainpage.component.css
│   │   ├── iframepage/          # Iframe page component for chess boards
│   │   │   ├── iframepage.component.ts
│   │   │   ├── iframepage.component.html
│   │   │   └── iframepage.component.css
│   │   └── online-game/         # (Optional) Components for online mode (not implemented)
│   ├── index.html               # Main HTML file
│   ├── main.ts                  # Application bootstrap file
│   └── styles.css               # Global styles
├── angular.json                 # Angular CLI configuration
├── package.json                 # Project metadata and dependencies
└── tsconfig.json                # TypeScript configuration
```

---

## Getting Started

This project requires [Node.js](https://nodejs.org/) and the [Angular CLI](https://angular.io/cli) to be installed on your machine.

---

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/pencil-fe-assignment.git
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

## Usage

### Running the Application Locally

To serve the application locally, run:

```bash
ng serve
```

- Open your browser at `http://localhost:4200/mainpage` to view the main page.
- The main page hosts two iframes:
  - **Iframe1 (Player 1, White):** Enabled by default.
  - **Iframe2 (Player 2, Black):** Rotated for proper perspective and disabled initially.
- Moves made in one iframe are synchronized with the other via the postMessage API.
- A reset button is available to restart the game.

---

## Communication Model

- **From Child to Parent:**  
  When a move is made on a chess board, the IframepageComponent sends a move object (including FEN, PGN, and a `from` identifier) to the parent via `window.parent.postMessage`.

- **Parent Processing:**  
  The MainpageComponent listens for these messages, toggles the current turn, broadcasts a turn update message, and forwards the move to the opposite iframe. The game state is stored in LocalStorage.

- **From Parent to Child:**  
  Each IframepageComponent listens for turn updates and reset messages to update its state and board accordingly.

---

## Game State & Persistence

- **Saving State:**  
  After every move, the parent component saves the current game state (FEN and current turn) in LocalStorage.

- **Loading State:**  
  On startup, each IframepageComponent checks LocalStorage. If a saved game exists, it uses `setFEN(state.fen)` (and applies necessary board reversals) to restore the previous game state.

- **Resetting State:**  
  When a checkmate is detected or when the user clicks the reset button, the game state is cleared and the boards are reset.

---

## Contributing

Contributions are welcome! If you find issues or have suggestions for improvement, please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Enjoy the game, and happy coding!*
```

---

Feel free to adjust the text and details to better match your project specifics.
