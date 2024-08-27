# Chess-Like Game

## Overview

This project is a chess-like game designed for two players using WebSockets for real-time interaction. The game board and rules are simplified compared to traditional chess, featuring custom piece movements and turn-based play. The client and server communicate using WebSockets to synchronize game state and handle player actions.

## Project Structure

The project is organized into the following main directories:
   ```   
   project-root |-- /client | |-- /styles | | |-- styles.css | |-- /scripts | | |-- game.js | | |-- websocket.js | |-- index.html |-- /server | |-- server.js |-- README.md |-- rules.txt
```

## Client-Side

### `index.html`

The `index.html` file serves as the main entry point for the client-side application. It sets up the HTML structure, including navigation, the game board, and a modal for displaying game rules.

### `/styles/styles.css`

This file contains the CSS styles for the game interface. It defines the appearance of the game board, modal dialogs, buttons, and other elements.

### `/scripts/game.js`

This JavaScript file contains the game logic, including piece movement, turn management, and board rendering. It interacts with the WebSocket server to synchronize game state.

### `/scripts/websocket.js`

This JavaScript file handles WebSocket connections and communication with the server. It manages events such as player assignment, game updates, and turn changes.

## Server-Side

### `server.js`

The `server.js` file sets up the WebSocket server, handles player connections, and manages game state. It listens for events from clients, processes game moves, and broadcasts updates to all connected players.

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Aditya01jain/Aditya_Jain_21BCY10190
   cd Aditya_Jain_21BCY10190
   
2. **Install Dependencies**
    Navigate to the server directory and install the necessary Node.js packages:
   ```bash
   cd server
   npm install
   
3. **Run the Server**
    Start the WebSocket server:
   ```bash
   node server.js
4. **Open the Clientr**
    Open index.html in your web browser to start the game. Ensure the server is running to allow the client to connect via WebSockets.
   ```bash
   ./client/html/index.html
   
