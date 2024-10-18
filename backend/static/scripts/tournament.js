// tournament.js

export class Tournament {
    constructor(players) {
        this.players = players;
        this.pong = new Pong(2, true, this.winnerCallback);

        if (this.players.length == 3)
            this.playerArray = this.getUniqueRandomPlayers3();
        else
            this.playerArray = this.getUniqueRandomPlayers4();

        this.keyboardEventHandlerBind = this.handleKeyboardEvent.bind(this);
        this.currentPlayer1 = this.players[this.playerArray[0]];
        this.currentPlayer2 = this.players[this.playerArray[1]];
        this.winner = "";
        this.isFinalGame = false;
        this.semiFinalWinner1 = "";
        this.semiFinalWinner2 = "";
    }

    winnerCallback = (winner) => {
        var element = document.getElementById('winnerT');
        var elementFinal = document.getElementById('winnerF');
        if (winner == 'left') {
            element.innerText = this.currentPlayer1 + " Player wins!";
            elementFinal.innerText = this.currentPlayer1 + " won the Tournament!";
            this.winner = this.currentPlayer1;
        }
        else {
            element.innerText = this.currentPlayer2 + " Player wins!";
            elementFinal.innerText = this.currentPlayer2 + " won the Tournament!";
            this.winner = this.currentPlayer2;
        }
        if (this.players.length == 4) {
            if (this.semiFinalWinner1 == "")
                this.semiFinalWinner1 = this.winner;
            else
                this.semiFinalWinner2 = this.winner;
        }
        if (this.isFinalGame == true) {
            var myModal = new bootstrap.Modal('#winnerFinalpopup');
            myModal.show();
        }
        else {
            var myModal = new bootstrap.Modal('#winnerTpopup');
            myModal.show();
        }
    }

    getUniqueRandomPlayers3() {
        const numbers = [0, 1, 2];
        return this.shuffleArray(numbers);
    }

    getUniqueRandomPlayers4() {
        const numbers = [0, 1, 2, 3];
        return this.shuffleArray(numbers);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return (array);
    }

    startTournament() {
        this.displayGameAnnouncement("Semi Final", this.players[this.playerArray[0]], this.players[this.playerArray[1]]);
        document.addEventListener('keydown', this.keyboardEventHandlerBind);
    }

    resetTournament() {
        document.removeEventListener('keydown', this.keyboardEventHandlerBind);
        this.pong.stop();
    }

    nextMatch() {
        if (this.players.length == 4) {
            if (this.semiFinalWinner1 == this.winner && this.semiFinalWinner2 == "") {
                this.currentPlayer1 = this.players[this.playerArray[2]];
                this.currentPlayer2 = this.players[this.playerArray[3]];
                this.displayGameAnnouncement("Semi Final", this.players[this.playerArray[2]], this.players[this.playerArray[3]]);
            }
            if (this.semiFinalWinner2 == this.winner) {
                this.displayGameAnnouncement("Final", this.semiFinalWinner1, this.semiFinalWinner2);
                this.currentPlayer1 = this.semiFinalWinner1;
                this.currentPlayer2 = this.semiFinalWinner2;
                this.isFinalGame = true;
            }
        }
        else {
            this.displayGameAnnouncement("Final", this.winner, this.players[this.playerArray[2]]);
            this.isFinalGame = true;
        }
        document.addEventListener('keydown', this.keyboardEventHandlerBind);
    }

    handleKeyboardEvent(event) {
        if (event.key === 'Enter') {
            document.removeEventListener('keydown', this.keyboardEventHandlerBind);
            this.pong.start();
        }
    }

    displayGameAnnouncement(gameType, firstPlayerName, secondPlayerName) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.font = "50px 'Press Start 2P'";

        var textWidth = ctx.measureText(gameType).width;
        ctx.fillText(gameType, (canvas.width / 2) - (textWidth / 2), (canvas.height / 2) - 200);
        ctx.font = "50px 'Press Start 2P'";
        textWidth = ctx.measureText(firstPlayerName + " X " + secondPlayerName).width;
        ctx.fillText(firstPlayerName + " X " + secondPlayerName, (canvas.width / 2) - (textWidth / 2), (canvas.height / 2) - 50);
        ctx.font = "50px 'Press Start 2P'";
        textWidth = ctx.measureText("Press Enter to Start").width;
        ctx.fillText("Press Enter to Start", (canvas.width / 2) - (textWidth / 2), (canvas.height / 2) + 100);
    }
}
