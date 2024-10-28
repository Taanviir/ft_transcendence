// tictactoe.js

let gameId = null;
let currentPlayer = 'X';
let gameEnded = false;
let resultModal = null;

function tictactoeInit() {
    // Show the modal automatically when the page loads
    let opponentModal = new bootstrap.Modal(document.getElementById('opponentModal'));
    opponentModal.show();

    document.getElementById('opponentForm').addEventListener('submit', function (event) {
        event.preventDefault();
        startGame();
        opponentModal.hide();
    });

    // Initialize result modal instance
    resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
}

function renderBoard(board) {
    if (!board) return;

    const gameContainer = document.getElementById('game');
    gameContainer.innerHTML = '';

    const boardDiv = document.createElement('div');
    boardDiv.className = 'board';
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = `cell ${cell}`;
            cellDiv.textContent = cell;

            // Only add click listener to empty cells
            if (cell === "")
                cellDiv.addEventListener('click', () => makeMove(rowIndex, colIndex));

            if (!gameEnded)
                cellDiv.style.cursor = currentPlayer === 'X' ? 'url(/static/images/cursor-x.svg), auto' : 'url(/static/images/cursor-o.svg), auto';
            else
                cellDiv.style.cursor = 'default';

            boardDiv.appendChild(cellDiv);
        });
    });
    gameContainer.appendChild(boardDiv);
    document.getElementById('ttt').style.display = 'flex';

    highlightCurrentPlayer();
}

function highlightCurrentPlayer() {
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');

    const userPlayer = document.getElementById('player1-name').textContent.includes('(X)') ? 'X' : 'O';

    if (currentPlayer === userPlayer) {
        player1.classList.add('active-player');
        player2.classList.remove('active-player');
    } else {
        player2.classList.add('active-player');
        player1.classList.remove('active-player');
    }
}

function startGame() {
    const form = document.getElementById('opponentForm');
    const formData = new FormData(form);

    fetch('/ttt/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': formData.get('csrfmiddlewaretoken')
        },
        body: JSON.stringify({ opponent_name: formData.get('opponent_name') })
    })
        .then(response => response.json())
        .then(data => {
            gameId = data.game_id;
            currentPlayer = data.current_player;
            gameEnded = false;

            // Assign player roles
            const userPlayer = data.user_player;
            const opponentPlayer = data.opponent_player;

            // Display player names and roles
            document.getElementById('userSymbol').textContent = `(${userPlayer})`;
            document.getElementById('player2-name').textContent = `${formData.get('opponent_name')} (${opponentPlayer})`;

            renderBoard(data.board);
            if (resultModal)
                resultModal.hide();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function makeMove(rowIndex, colIndex) {
    if (gameEnded) return;

    fetch(`/ttt/move/${gameId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
        },
        body: JSON.stringify({
            row: rowIndex,
            col: colIndex,
            player: currentPlayer
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.winner || data.draw) {
                gameEnded = true;
                showResultModal(data.winner ? `${data.winner} wins!` : "It's a draw!");
            }

            currentPlayer = data.current_player;
            renderBoard(data.board);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function showResultModal(resultMessage) {
    document.getElementById('result-message').textContent = resultMessage;
    resultModal.show();
}
