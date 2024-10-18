// pong.js

import { Ball } from './ball.js';
import { PaddleTypes, Paddle } from './paddle.js';
import { Score } from './score.js';
import { Tournament } from './tournament.js';

export let BALL_SPEED = 10;
export let PADDLE_SPEED = 10;
export let SCORE_TO_WIN = 5;

const visualModes = {
    default: {
        backgroundColor: 'black',
        paddleColor: 'white',
        ballColor: 'white',
        paddleHeight: 50,
        ballRadius: 10
    },
    visualImpaired: {
        backgroundColor: 'blue',
        paddleColor: 'yellow',
        ballColor: 'red',
        paddleHeight: 100,
        ballRadius: 20
    },
};

// TODO: FIX ERRORS
// TODO: HANDLE ALL CASES; 1V1, 2V2, GUEST, CONFIG, VISUAL, HELP, HOME, BACK, ETC

export class Game {
    constructor(canvas, players, isTournament = false, notifyWinner = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.players = players;
        this.nbPlayers = players.length > 2 ? 4 : 2;

        this.isTournament = isTournament;
        this.notifyWinner = notifyWinner;

        this.isGameRunning = false;
        this.intervalId = 0;
        this.keys = {};


        this.paddles = [
            new Paddle(PaddleTypes.LEFT1, this.canvas, this.ctx),
            new Paddle(PaddleTypes.RIGHT1, this.canvas, this.ctx),
        ];
        if (this.nbPlayers === 4) {
            this.paddles.push(new Paddle(PaddleTypes.LEFT2, this.canvas, this.ctx));
            this.paddles.push(new Paddle(PaddleTypes.RIGHT2, this.canvas, this.ctx));
        }

        this.score = new Score(canvas, this.ctx);
        this.ball = new Ball(canvas, this.ctx, this.score, this.paddles, this.canvas.width / 100);

        this.count = 3;
        this.isMuted = false;
        this.visualMode = 'default';
        this.applyVisualMode(this.visualMode);
    }

    init() {
        this.drawBackground();
        this.drawStartScreen();
        this.paddles.forEach(paddle => paddle.resetPosition());
        this.score.resetScore();
        this.ball.ballResetPosition();

        const handleEnter = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();

                // document.getElementById('titleOverlay').style.display = 'none';
                // document.getElementById('startOverlay').style.display = 'none';
                this.countdown();
                document.removeEventListener('keydown', handleEnter);
            }
        };
        document.addEventListener('keydown', handleEnter);
    }

    countdown() {
        this.drawCountdown();
        const interval = setInterval(() => {
            if (this.count === 1) {
                clearInterval(interval);
                this.start();
            }
            else {
                this.count--;
                this.drawCountdown();
            }
        }, 1000);
    }

    start() {
        this.isGameRunning = true;

        document.addEventListener('keydown', this.handleKeyboardEvent.bind(this));
        document.addEventListener('keyup', this.handleKeyboardEvent.bind(this));

        this.intervalId = setInterval(this.gameLoop.bind(this), 1000 / 60); // 60 FPS
        this.ball.startBallMovement();
    }

    pause() {
        clearInterval(this.intervalId);
        this.isGameRunning = false;
    }

    resume() {
        if (!this.isGameRunning) {
            this.intervalId = setInterval(this.gameLoop.bind(this), 1000 / 60);
            this.ball.resumeBallMovement();
            this.isGameRunning = true;
        }
    }

    reset() {
        this.pause();
        this.score.resetScore();
        this.ball.ballResetPosition();
        this.paddles.forEach(paddle => paddle.resetPosition());
        this.count = 3;
    }

    playAgain() {
        this.reset();
        this.start();
    }

    stop() {
        clearInterval(this.intervalId);
        document.removeEventListener('keydown', this.handleKeyboardEvent.bind(this));
        document.removeEventListener('keyup', this.handleKeyboardEvent.bind(this));
        this.isGameRunning = false;
    }

    gameLoop() {
        this.render();
        this.ball.ballMove();
        this.updatePaddles();

        if (this.score.checkGameOver()) {
            this.displayWinner();
            this.stop();
        }
    }

    handleKeyboardEvent(event) {
        if (event.type === 'keydown')
            this.keys[event.key] = true;
        else if (event.type === 'keyup')
            this.keys[event.key] = false;
    }

    updatePaddles() {
        if (this.keys['q']) this.paddles[0].up(this.ball);
        if (this.keys['a']) this.paddles[0].down(this.ball);
        if (this.keys['p']) this.paddles[1].up(this.ball);
        if (this.keys['l']) this.paddles[1].down(this.ball);

        if (this.nbPlayers === 4) {
            if (this.keys['d']) this.paddles[2].up(this.ball);
            if (this.keys['c']) this.paddles[2].down(this.ball);
            if (this.keys['j']) this.paddles[3].up(this.ball);
            if (this.keys['n']) this.paddles[3].down(this.ball);
        }
    }

    render() {
        this.drawBackground();
        this.drawGameBoard();
        this.paddles.forEach(paddle => paddle.drawPaddle(this.paddleColor));
        this.score.drawScore(this.ballColor);
        this.ball.draw(this.ballColor);
    }

    toggleVisualMode() {
        this.visualMode = this.visualMode === 'default' ? 'visualImpaired' : 'default';
        this.applyVisualMode(this.visualMode);
        this.drawBackground();
        if (!this.isGameRunning)
            this.drawStartScreen();
    }

    applyVisualMode(mode) {
        const selectedMode = visualModes[mode];

        this.backgroundColor = selectedMode.backgroundColor;
        this.paddleColor = selectedMode.paddleColor;
        this.ballColor = selectedMode.ballColor;
        this.paddleHeight = selectedMode.paddleHeight;
        this.ballRadius = selectedMode.ballRadius;

        const eyeButton = document.getElementById('visualModeButton');
        if (mode === 'visualImpaired') {
            eyeButton.classList.remove('fa-eye-slash');
            eyeButton.classList.add('fa-eye');
        }
        else {
            eyeButton.classList.remove('fa-eye');
            eyeButton.classList.add('fa-eye-slash');
        }
    }

    drawStartScreen() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = "128px 'Press Start 2P'";
        var textWidth = this.ctx.measureText("PONG").width;
        this.ctx.fillText("PONG", (this.canvas.width / 2) - (textWidth / 2), (this.canvas.height / 2) - 100);
        this.ctx.font = "32px 'Press Start 2P'";
        var textWidth1 = this.ctx.measureText("Press Enter to Start").width;
        this.ctx.fillText("Press Enter to Start", (this.canvas.width / 2) - (textWidth1 / 2), (this.canvas.height / 2) + 100);
    }

    drawBackground() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGameBoard() {
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
    }

    drawCountdown() {
        this.drawBackground();
        this.ctx.font = "280px 'Press Start 2P'";
        this.ctx.fillStyle = 'red';
        const textWidth = this.ctx.measureText(this.count).width;
        this.ctx.fillText(this.count, (this.canvas.width / 2) - (textWidth / 2), (this.canvas.height / 2) + (textWidth / 2));
    }

    displayWinner() {
        const winnerElement = document.getElementById('winner');

        //TODO: update this to show player names

        console.log(this.players);

        if (this.score.scoreL === SCORE_TO_WIN)
            winnerElement.innerText = "Left Player wins!"; //! change this to player name
        else
            winnerElement.innerText = "Right Player wins!";

        if (this.notifyWinner)
            this.notifyWinner(this.getWinner());

        const myModal = new bootstrap.Modal('#winnerpopup');
        myModal.show();
    }

    getWinner() {
        return this.score.scoreL === SCORE_TO_WIN ? "left" : "right";
    }

    // Additional method for handling the next match in a tournament
    nextMatch() {
        if (this.isTournament)
            this.notifyWinner(this.getWinner());
    }

    toggleMute() {
        this.isMuted = !this.isMuted;

        const audioElements = document.getElementsByTagName('audio');
        const muteButton = document.getElementById('muteButton');

        // Mute/unmute all audio elements
        for (let audio of audioElements)
            audio.muted = this.isMuted;

        if (this.isMuted) {
            muteButton.classList.remove('fa-volume-up');
            muteButton.classList.add('fa-volume-mute');
            muteButton.setAttribute('title', 'Unmute Sound');
        }
        else {
            muteButton.classList.remove('fa-volume-mute');
            muteButton.classList.add('fa-volume-up');
            muteButton.setAttribute('title', 'Mute Sound');
        }
    }

    applyConfiguration() {
        PADDLE_SPEED = parseInt(document.getElementById('playerspeed').value, 10);
        BALL_SPEED = parseInt(document.getElementById('ballspeed').value, 10);
        SCORE_TO_WIN = parseInt(document.getElementById('scoreSlider').value, 10);

        this.paddles.forEach(paddle => paddle.updateSpeed(PADDLE_SPEED));
        this.ball.updateSpeed(BALL_SPEED);

        this.resume();
    }

    loadConfiguration() {
        if (this.isGameRunning)
            document.getElementById('scoreSlider').disabled = true;
        else
            document.getElementById('scoreSlider').disabled = false;

        this.pause();

        // reset game values
        document.getElementById('playerspeed').value = PADDLE_SPEED;
        document.getElementById('ballspeed').value = BALL_SPEED;
        document.getElementById('scoreSlider').value = SCORE_TO_WIN;
        document.getElementById('customSwitch').checked = true;
    }
}
