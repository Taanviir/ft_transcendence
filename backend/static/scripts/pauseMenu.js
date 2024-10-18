// pauseMenu.js

import { BALL_SPEED, PADDLE_SPEED } from './pong.js';
import { getPage } from './main.js';

export default function pauseMenu(game) {
    game.pause();

    const pauseMenuModal = new bootstrap.Modal('#pauseMenuModal');
    pauseMenuModal.show();

    // Resume game
    const resumeButton = document.getElementById('resumeGameButton');
    resumeButton.removeEventListener('click', resumeGame);
    resumeButton.addEventListener('click', resumeGame);

    function resumeGame() {
        pauseMenuModal.hide();
        game.resume();
    }

    // Open Settings modal
    const settingsButton = document.getElementById('settingsButton');
    settingsButton.removeEventListener('click', openSettings);
    settingsButton.addEventListener('click', openSettings);

    function openSettings() {
        setupGameSettingsModalDropdown();
        const settingsModal = new bootstrap.Modal('#gameSettingsModal');
        pauseMenuModal.hide();
        settingsModal.show();

        // Back button in Settings Modal
        const backButton = document.getElementById('backToPauseMenuFromSettings');
        backButton.removeEventListener('click', backToPauseMenu);
        backButton.addEventListener('click', backToPauseMenu);

        function backToPauseMenu() {
            settingsModal.hide();
            pauseMenuModal.show();
        }
    }

    // Open Help modal
    const helpButton = document.getElementById('helpButton');
    helpButton.removeEventListener('click', openHelp);
    helpButton.addEventListener('click', openHelp);

    function openHelp() {
        const helpModal = new bootstrap.Modal('#helpModal');
        pauseMenuModal.hide();
        helpModal.show();

        // Back button in Help Modal
        const backButton = document.getElementById('backToPauseMenuFromHelp');
        backButton.removeEventListener('click', backToPauseMenu);
        backButton.addEventListener('click', backToPauseMenu);

        function backToPauseMenu() {
            helpModal.hide();
            pauseMenuModal.show();
        }
    }

    // Quit game and go back to home
    const quitButton = document.getElementById('backToHomeButton');
    quitButton.removeEventListener('click', showQuitConfirmation());
    quitButton.addEventListener('click', showQuitConfirmation());

    function showQuitConfirmation() {
        const quitConfirmationModal = new bootstrap.Modal('#quitConfirmationModal');
        pauseMenuModal.hide();
        quitConfirmationModal.show();

        const confirmQuitButton = document.getElementById('confirmQuitButton');
        confirmQuitButton.addEventListener('click', confirmQuit);

        function confirmQuit() {
            quitConfirmationModal.hide();
            game.stop();
            getPage('/'); // Redirect to home page
        }
    }
}

function setupGameSettingsModalDropdown() {
    const modal = document.getElementById('gameSettingsModal');
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
