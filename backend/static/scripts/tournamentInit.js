// tournamentInit.js

//TODO rework this entire file

let selectedMode = 'Medium'; // Default value
let scoreToWin = 7; // Default score
let currentRound = 0; // Track the current round
let matches = []; // Store the current matches

function registerPlayers(players) {
    matches = generateRandomMatches(players);
    console.log('Players registered:', players);
    updateTournamentTable();
}

function generateRandomMatches(players) {
    // Shuffle players randomly
    const shuffledPlayers = players.sort(() => 0.5 - Math.random());
    const matches = [];

    for (let i = 0; i < shuffledPlayers.length; i += 2) {
        const player1 = shuffledPlayers[i];
        const player2 = shuffledPlayers[i + 1] || "Bye";
        matches.push({ player1, player2, winner: null });
    }

    return matches;
}

function updateTournamentTable() {
    const tableBody = document.getElementById('tournament-table');
    tableBody.innerHTML = ''; // Clear existing table content

    matches.forEach((match, index) => {
        const row = document.createElement('tr');

        const matchCell = document.createElement('td');
        matchCell.textContent = index + 1; // Match number

        const player1Cell = document.createElement('td');
        player1Cell.textContent = match.player1;

        const player2Cell = document.createElement('td');
        player2Cell.textContent = match.player2;

        const winnerCell = document.createElement('td');
        winnerCell.innerHTML = match.winner ? match.winner : `<button onclick="selectWinner(${index})">Select Winner</button>`;

        row.appendChild(matchCell);
        row.appendChild(player1Cell);
        row.appendChild(player2Cell);
        row.appendChild(winnerCell);

        tableBody.appendChild(row);
    });
}

function selectWinner(matchIndex) {
    const winner = prompt("Enter the winner's name:"); // Replace with a more sophisticated UI in production
    if (winner) {
        matches[matchIndex].winner = winner;
        // Update the tournament table to reflect the winner
        updateTournamentTable();
        checkForNextRound(); // Check if the next round can be created
    }
}

function checkForNextRound() {
    // Check if all matches in the current round have winners
    if (matches.every(match => match.winner)) {
        // Create a new round with winners
        const winners = matches.map(match => match.winner);
        matches = generateRandomMatches(winners);
        currentRound++;
        updateTournamentTable(); // Refresh the table
    }
}

function handleDropdown() {
    const modeDropdown = document.querySelector('#tournamentSettings .dropdown-toggle');
    const dropdownItems = document.querySelectorAll('#tournamentSettings .dropdown-item');

    dropdownItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();

            selectedMode = event.target.textContent;
            modeDropdown.textContent = selectedMode; // Update the displayed text on the button
        });
    });
}

function handleScoreSlider() {
    const scoreSlider = document.getElementById('scoreSlider');
    scoreSlider.addEventListener('input', (event) => {
        scoreToWin = event.target.value;
        document.getElementById('scoreDisplay').innerText = scoreToWin;
    });
}

export default function tournamentInit() {
    // TODO select tournament settings (difficulty and score to win)
    const tournamentModal = new bootstrap.Modal('#tournamentModal');
    tournamentModal.show();

    const playerInputs = ['alias1', 'alias2', 'alias3', 'alias4'];

    let players = [];
    const tournamentForm = document.getElementById('tournament-form');

    handleDropdown();
    handleScoreSlider();
    tournamentForm.addEventListener('submit', (event) => {
        event.preventDefault();

        tournamentForm.classList.remove('was-validated');

        let allValid = true;
        playerInputs.forEach((inputId) => {
            const inputField = document.getElementById(inputId);
            if (inputField.checkValidity()) {
                inputField.classList.remove('is-invalid');
                inputField.classList.add('is-valid');
            }
            else {
                allValid = false;
                inputField.classList.add('is-invalid');
            }
        });

        playerInputs.forEach((inputId) => {
            const alias = document.getElementById(inputId).value.trim();
            if (alias) players.push(alias);
        });

        if (!allValid) return;
        tournamentForm.classList.add('was-validated');

        registerPlayers(players);

        tournamentModal.hide();
        document.getElementById('tournament').style.display = 'block';
    });

}
