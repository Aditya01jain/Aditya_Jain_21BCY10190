document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('rulesModal');
    const rulesLink = document.querySelector('#navbar ul li a[href="#"]'); // Selecting the Rules link
    const closeModal = document.querySelector('.close');

    rulesLink.addEventListener('click', (event) => {
        event.preventDefault();
        modal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close the modal if user clicks outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    let board = [];
    let player; // Store the assigned player (A or B)
    let currentTurn; // Track whose turn it is
    let selectedPiece = null; // Track the currently selected piece
    const socket = io('http://localhost:3000');

    // Listen for the assigned player role from the server
    socket.on('playerAssigned', (assignedPlayer) => {
        player = assignedPlayer;
        const playerInfoElement = document.getElementById('Player_name');
        if (playerInfoElement) {
            playerInfoElement.textContent = `You are Player ${player}`;
        }
    });

    // Listen for the game start event and receive the board
    socket.on('startGame', (receivedBoard) => {
        board = receivedBoard;
        renderBoard(board);
    });
    socket.on('updateBoard', (updatedBoard) => {
        board = updatedBoard;
        renderBoard(board);
    });

    // Listen for turn changes
    socket.on('turnChanged', (newTurn) => {
        currentTurn = newTurn;
        const currentTurnElement = document.getElementById('current-turn');
        if (currentTurnElement) {
            currentTurnElement.textContent = `Current Turn: Player ${currentTurn}`;
        }

        // Show the "End Turn" button only if it's this player's turn
        const endTurnButton = document.getElementById('end-turn-button');
        if (currentTurn === player) {
            endTurnButton.style.display = 'block';
        } else {
            endTurnButton.style.display = 'none';
            clearSelection(); // Clear any selected piece and moves if it's not the player's turn
        }
    });
    socket.on('invalidMove', (errorMessage) => {
        alert(errorMessage); // Show the invalid move alert
    });
    socket.on('gameOver', (message) => {
        alert(message);
        if (confirm('Do you want to start a new game?')) {
            // Optionally, you can send a restart request to the server if needed
            socket.emit('restartGame');
        } else {
            alert("Thanks For Playing!!")
        }
    });
    // Handle game reset event
    socket.on('gameReset', (message) => {
        alert(message);
        board = [];
        document.getElementById('board').innerHTML = '';
        document.getElementById('current-turn').textContent = '';
        document.getElementById('end-turn-button').style.display = 'none';
    });

    // Handle piece selection
    function selectPiece(row, col) {
        const piece = board[row][col];
        if (currentTurn === player && piece.startsWith(player)) {
            selectedPiece = { piece, row, col };
            clearMoves();
            showAvailableMoves(piece);
        } else if (currentTurn !== player) {
            showToast("It's not your turn!");
        } else if (!piece.startsWith(player)) {
            showToast("You can't move the opponent's piece!");
        }
    }
    
    // Function to show a toast notification
    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.className = "toast show";
    
        // Hide the toast after 3 seconds
        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 3000);
    }
    
    // Show available moves for the selected piece
    function showAvailableMoves(piece) {
        const validMoves = getValidMoves(piece);
        const movesElement = document.getElementById('moves');
        movesElement.innerHTML = ''; // Clear previous moves
        validMoves.forEach(move => {
            const moveElement = document.createElement('button');
            moveElement.textContent = move;
            moveElement.classList.add('move');
            moveElement.addEventListener('click', () => movePiece(piece, move));
            movesElement.appendChild(moveElement);
        });
    }

    // Clear move indicators and selections
    function clearSelection() {
        selectedPiece = null;
        clearMoves();
    }

    // Clear move indicators
    function clearMoves() {
        const movesElement = document.getElementById('moves');
        movesElement.innerHTML = ''; // Clear moves display
    }

    // Get valid moves for a piece (example logic based on piece type)
    function getValidMoves(piece) {
        const moves = {
            'P': ['L', 'R', 'U', 'D'],
            'H1': ['L', 'R', 'U', 'D'],
            'H2': ['FL', 'FR', 'BL', 'BR']
        };
        if (piece[2] === 'P') {
            return moves['P'];
        }
        const type = piece.slice(-2);
        return moves[type] || [];
    }

    // Move a piece to a new location
    function movePiece(selectedPiece, direction) {

        socket.emit('pieceMoved', { selectedPiece, direction, player });

        clearSelection(); // Clear selection after moving
        renderBoard(board);
    }

    // Function to render the board on the client
    function renderBoard(board) {
        const boardElement = document.getElementById('board');
        if (boardElement) {
            boardElement.innerHTML = ''; // Clear any existing board
            board.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const cellElement = document.createElement('div');
                    cellElement.className = 'cell';
                    cellElement.dataset.row = rowIndex;
                    cellElement.dataset.col = colIndex;
                    cellElement.textContent = cell;
                    cellElement.addEventListener('click', () => selectPiece(rowIndex, colIndex));
                    boardElement.appendChild(cellElement);
                });
            });
        }
    }
});