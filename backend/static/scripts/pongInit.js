// pong-init.js

import { Game, BALL_SPEED, PADDLE_SPEED } from './pong.js';
import { getPage } from './main.js';

export default function gameInit() {
    const usernameElement = document.querySelector('meta[name="username"]');
    const loggedInUsername = usernameElement ? usernameElement.getAttribute('content') : null;

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'test') {
        // TODO: testing only, remove after done
        // launchGame(['test1', 'tanas']); //* 1v1 test
        launchGame(['test1', 'tanas', 'qqq', 'www']); //* 2v2 test
        // launchGame(['test1', 'tanas', 'qqq', 'www'], true); //* tournament test
        return;
    }

    const gameModes = [
        { mode: '1v1', loggedIn: true, players: 2 },
        { mode: '2v2', loggedIn: true, players: 4 },
        { mode: 'guest', loggedIn: false, players: 2 },
    ];

    // Find the game mode object based on the 'mode' parameter
    const selectedMode = gameModes.find(gameMode => gameMode.mode === mode);
    if (!selectedMode) {
        alert('Invalid mode selected');
        getPage('/');
        return;
    }

    // Check if the login status matches the selected mode's requirement
    const isLoggedIn = (loggedInUsername !== null);
    if (selectedMode.loggedIn && !isLoggedIn) {
        alert('You must be logged in to access this mode');
        getPage('/');
        return;
    }
    else if (!selectedMode.loggedIn && isLoggedIn) {
        alert('You are already logged in, you cannot play as guest');
        getPage('/');
        return;
    }

    if (selectedMode.mode === '1v1' || selectedMode.mode === '2v2')
        askForPlayerNames(selectedMode.players, true, loggedInUsername);
    else if (selectedMode.mode === 'guest')
        askForPlayerNames(selectedMode.players, false);
    else if (selectedMode.mode === 'tournament')
        console.log('Tournament mode selected');
}

function generatePlayerNamesForm(playerNamesForm, playerInputs) {
    playerNamesForm.innerHTML = '';

    // Create fields depending on visibility
    playerInputs.forEach(({ divId, inputId, visible }) => {
        if (visible) {
            // Create the div element for the input field
            const playerDiv = document.createElement('div');
            playerDiv.className = 'mb-3';
            playerDiv.id = divId;

            // Create the label element
            const label = document.createElement('label');
            label.htmlFor = inputId;
            label.className = 'form-label';
            label.textContent = `${inputId.charAt(0).toUpperCase() + inputId.slice(1, -1)} ${inputId.at(-1)}*`;

            // Create the input field
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.id = inputId;
            input.required = true;
            input.pattern = '[a-zA-Z0-9_]+';
            input.maxLength = 20;

            // Append elements to the div
            playerDiv.appendChild(label);
            playerDiv.appendChild(input);

            // Append the div to the form
            playerNamesForm.appendChild(playerDiv);
        }
    });

    // Create the info element
    const nameInfo = document.createElement('div');
    nameInfo.className = 'text-center';
    nameInfo.style.fontSize = "0.6rem";
    nameInfo.textContent = "Name must be between 1 and 20 characters, alphanumeric, or underscores.";

    playerNamesForm.appendChild(nameInfo);
}

function askForPlayerNames(numOfPlayers, isLoggedIn, loggedInUsername = '') {
    const playerNameModal = new bootstrap.Modal('#playerNameModal');
    const playerInputs = [
        { divId: 'player1Div', inputId: 'player1', visible: !isLoggedIn },
        { divId: 'player2Div', inputId: 'player2', visible: true },
        { divId: 'player3Div', inputId: 'player3', visible: numOfPlayers === 4 },
        { divId: 'player4Div', inputId: 'player4', visible: numOfPlayers === 4 },
    ];

    let players = [];
    if (isLoggedIn)
        players.push(loggedInUsername);

    const playerNamesForm = document.getElementById('playerNamesForm');
    generatePlayerNamesForm(playerNamesForm, playerInputs);

    playerNameModal.show();

    playerNamesForm.addEventListener('submit', (event) => {
        event.preventDefault();

        playerInputs.forEach(({ inputId, visible }) => {
            if (visible) {
                const playerName = document.getElementById(inputId).value.trim();
                if (playerName) players.push(playerName);
            }
        });

        playerNameModal.hide();

        document.getElementById('player1name').innerText = players[0].length > 5 ? players[0].slice(0, 5) + '.' : players[0];
        document.getElementById('player2name').innerText = players[1].length > 5 ? players[1].slice(0, 5) + '.' : players[1];
        if (playerNames.length === 4) {
            document.getElementById('player3name').innerText = players[2].length > 5 ? players[2].slice(0, 5) + '.' : players[2];
            document.getElementById('player4name').innerText = players[3].length > 5 ? players[3].slice(0, 5) + '.' : players[3];
        }

        launchGame(playerNames);
    });
}

function setupConfigModalDropdown() {
    const modal = document.getElementById('configModal');
    const dropdownMenu = modal.querySelector('.dropdown-menu');

    const gameConfig = {
        "Easy": { paddleSpeed: 15, ballSpeed: 7 },
        "Medium": { paddleSpeed: 30, ballSpeed: 15 },
        "Hard": { paddleSpeed: 66, ballSpeed: 33 },
    };

    dropdownMenu.addEventListener('click', (event) => {
        const selectedItem = event.target.closest('.dropdown-item');
        if (selectedItem) {
            event.preventDefault();

            const selectedText = selectedItem.textContent.trim();
            const dropdownButton = modal.querySelector('.dropdown-toggle');
            dropdownButton.textContent = selectedText;

            if (selectedText in gameConfig) {
                PADDLE_SPEED = gameConfig[selectedText].paddleSpeed;
                BALL_SPEED = gameConfig[selectedText].ballSpeed;
            }
            else if (selectedText === "Custom")
                document.getElementById("customConfig").style.display = "block";
            else
                console.error('Invalid difficulty level selected');

            const dropdown = new bootstrap.Dropdown(dropdownButton);
            dropdown.hide();
        }
    });
}

function launchGame(players, isTournament = false) {
    const canvas = document.getElementById('pongGame');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const game = new Game(canvas, players, isTournament);

    document.fonts.load('10pt "Press Start 2P"')
        .then(() => {
            return document.fonts.ready;
        })
        .then(() => {
            game.init();
            setupConfigModalDropdown();
            document.getElementById("pongContainer").style.display = "flex";

            document.getElementById('visualModeButton').addEventListener('click', () => game.toggleVisualMode());
            document.getElementById('helpButton').addEventListener('click', () => game.pause());
            document.getElementById('helpCloseButton').addEventListener('click', () => game.resume());
            document.getElementById('homeButton').addEventListener('click', () => game.reset());
            document.getElementById('playAgainButton').addEventListener('click', () => game.playAgain());
            document.getElementById('configButton').addEventListener('click', () => game.loadConfiguration());
            document.getElementById('applyConfigButton').addEventListener('click', () => game.applyConfiguration());
            document.getElementById('muteButton').addEventListener('click', game.toggleMute);
        })
        .catch(error => {
            console.error("Error loading font:", error);
        });
}
