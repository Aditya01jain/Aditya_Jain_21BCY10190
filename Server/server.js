const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (or you can specify a specific one)
        methods: ['GET', 'POST']
    }
});
const boardSize = 5;
let players = {}; 
let board = []; 
let currentTurn = 'A'; 
let positions = {};
let currentPlayer = 'A';
app.use(express.static(path.join(__dirname, 'public')));

function initializeBoard() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(' '));
    positions = {};

    let piecesA = ['A-P1', 'A-P2', 'A-P3', 'A-H1', 'A-H2'];
    let piecesB = ['B-P1', 'B-P2', 'B-P3', 'B-H1', 'B-H2'];

    piecesA = shuffleArray(piecesA);
    piecesB = shuffleArray(piecesB);
    for (let i = 0; i < boardSize; i++) {
        placePiece(piecesA[i], 0, i);
    }

    for (let i = 0; i < boardSize; i++) {
        placePiece(piecesB[i], boardSize - 1, i);
    }
    return board;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function movePiece(piece, direction) {
    const { x, y } = positions[piece];
    const moveDelta = getMoveDelta(piece, direction);
    const newX = x + moveDelta.x;
    const newY = y + moveDelta.y;

    if (isValidPosition(newX, newY, piece)) {
        // Handle combat if the new position is occupied
        if (board[newX][newY] !== ' ' && !board[newX][newY].startsWith(currentPlayer)) {
            // Remove the opponent's piece
            removePiece(board[newX][newY]);
        }

        // Move the piece to the new position
        board[x][y] = ' ';
        board[newX][newY] = piece;
        positions[piece] = { x: newX, y: newY };
        // Handle Hero1 and Hero2 special combat
        if (piece.startsWith('A-H1') || piece.startsWith('A-H2') || piece.startsWith('B-H1') || piece.startsWith('B-H2')) {
            handleHeroCombat(piece, x, y, newX, newY, direction);
        }
    } 
} function handleHeroCombat(piece, startX, startY, endX, endY, direction) {
    const type = piece.slice(-2);
    const deltas = {
        'H1': { L: { x: 0, y: -1 }, R: { x: 0, y: 1 }, U: { x: -1, y: 0 }, D: { x: 1, y: 0 } },
        'H2': { FL: { x: -1, y: -1 }, FR: { x: -1, y: 1 }, BL: { x: 1, y: -1 }, BR: { x: 1, y: 1 } }
    };
    const moveDelta = deltas[type][direction];
    let x = startX + moveDelta.x;
    let y = startY + moveDelta.y;

    // Identify the opponent's player prefix
    const opponentPrefix = piece.charAt(0) === 'A' ? 'B' : 'A';

    // Move through each position from the start to the end of the move
    while (true) {
        if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
            break;
        }

        // Check for an opponent's piece in the path and remove it
        if (board[x][y] !== ' ' && board[x][y].charAt(0) === opponentPrefix) {
            removePiece(board[x][y]);
        }

        // Stop if the move reaches the end position
        if (x === endX && y === endY) {
            break;
        }

        // Move to the next position along the path
        x += moveDelta.x;
        y += moveDelta.y;
    }

}


// Remove a piece from the board
function removePiece(piece) {
    const { x, y } = positions[piece];
    board[x][y] = ' ';
    delete positions[piece];
}

// Get move delta based on piece type and direction
function getMoveDelta(piece, direction) {
    const deltas = {
        'P': { L: { x: 0, y: -1 }, R: { x: 0, y: 1 }, U: { x: -1, y: 0 }, D: { x: 1, y: 0 } },
        'H1': { L: { x: 0, y: -2 }, R: { x: 0, y: 2 }, U: { x: -2, y: 0 }, D: { x: 2, y: 0 } },
        'H2': { FL: { x: -2, y: -2 }, FR: { x: -2, y: 2 }, BL: { x: 2, y: -2 }, BR: { x: 2, y: 2 } }
    };
    if (piece[2] == 'P') {
        return deltas['P'][direction] || { x: 0, y: 0 };
    }
    const type = piece.slice(-2);
    return deltas[type][direction] || { x: 0, y: 0 };
}
function validateMove(piece, direction) {
    const { x, y } = positions[piece];
    const moveDelta = getMoveDelta(piece, direction);
    const newX = x + moveDelta.x;
    const newY = y + moveDelta.y;

    // Check if the move is within the bounds of the board
    if (newX < 0 || newX >= boardSize || newY < 0 || newY >= boardSize) {
        return false;
    }

    if (piece[2] === 'P') {
        if (board[newX][newY].charAt(0) === 'A' || board[newX][newY].charAt(0) === 'B') {
            return false; // Same player's piece is blocking the path
        }

    } else {
        if (board[newX][newY].charAt(0) === piece.charAt(0)) {
            return false; // Same player's piece is blocking the path
        }
    }
    return true;
}
// Check if a position is valid
function isValidPosition(x, y, piece) {
    // Check if the target position is within the board's bounds
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
        return false;
    }

    if (piece[2] === 'P') {
        if (board[x][y].charAt(0) === 'A' || board[x][y].charAt(0) === 'B') {
            return false; // Same player's piece is blocking the path
        }

    } else {
        if (board[x][y].charAt(0) === piece.charAt(0)) {
            return false; // Same player's piece is blocking the path
        }
    }
    return true; // Position is valid if all checks pass
}

// Check if there's a winner
function checkForWinner() {
    console.log("checked");
    const piecesA = Object.keys(positions).filter(piece => piece.startsWith('A-'));
    const piecesB = Object.keys(positions).filter(piece => piece.startsWith('B-'));
    console.log("A",piecesA);
    console.log("B",piecesB);

    if (piecesA.length === 0) {
        io.emit('gameOver', 'Player B wins!');
        return true;
    } else if (piecesB.length === 0) {
        io.emit('gameOver', 'Player A wins!');
        return true;
    }

    return false;
}
// Place a piece on the board
function placePiece(piece, x, y) {
    board[x][y] = piece;
    positions[piece] = { x, y };
}

// Handle socket connections
io.on('connection', (socket) => {
    console.log(`New player connected: ${socket.id}`);

    // Assign player A or B
    if (!players.A) {
        players.A = socket.id;
        socket.emit('playerAssigned', 'A');
    } else if (!players.B) {
        players.B = socket.id;
        socket.emit('playerAssigned', 'B');
    } else {
        socket.emit('roomFull', 'Room is full, try again later.');
        socket.disconnect();
        return;
    }

    // Start the game when both players are connected
    if (Object.keys(players).length === 2) {
        board = initializeBoard();
        io.emit('startGame', board);
        io.emit('turnChanged', currentTurn); // Notify that it's Player A's turn
    }

    // Handle piece move event
    socket.on('pieceMoved', (moveData) => {
        console.log('Move received from player:', moveData);

        const { player, selectedPiece, direction } = moveData;

        // Add your move validation logic here
        const isValidMove = validateMove(selectedPiece, direction);

        if (isValidMove) {
            // Update the board and toggle the turn
            movePiece(selectedPiece, direction);
            console.log('Updated board:', board);
            io.emit('updateBoard', board);
            if (!checkForWinner()) {
                console.log("yes");
                currentTurn = currentTurn === 'A' ? 'B' : 'A';
                io.emit('turnChanged', currentTurn);
            }
        } else {
            // Send an invalid move alert to the player who made the move
            socket.emit('invalidMove', 'Invalid move! Please select a valid move.');
        }
    });

    // Handle turn end event
    socket.on('endTurn', (player) => {
        if (player === currentTurn) {
            currentTurn = currentTurn === 'A' ? 'B' : 'A'; // Toggle the turn
            io.emit('turnChanged', currentTurn);
        }
    });
    socket.on('restartGame', () => {// Reset the board and players
        io.emit('gameReset', 'The game has been reset. Starting a new game...');
        
        // Reassign players and start the game again
        if (players.A && players.B) {
            board = initializeBoard();
            io.emit('startGame', board);
            io.emit('turnChanged', currentTurn);
        }
    });
    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        if (players.A === socket.id) delete players.A;
        if (players.B === socket.id) delete players.B;

        // Reset the game if a player disconnects
        if (Object.keys(players).length < 2) {
            board = [];
            io.emit('gameReset', 'A player disconnected. The game has been reset.');
        }
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
