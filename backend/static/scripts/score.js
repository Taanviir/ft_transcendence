// utils.js

import { SCORE_TO_WIN } from './pong.js';

export class Score {
    constructor(canvas, ctx) {
        this.scoreL = 0;
        this.scoreR = 0;
        this.canvas = canvas;
        this.ctx = ctx;
    }

    incrementScoreL() { this.scoreL++; }

    incrementScoreR() { this.scoreR++; }

    checkGameOver() { return (this.scoreL === SCORE_TO_WIN || this.scoreR === SCORE_TO_WIN); }

    drawScore() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = "72px 'Press Start 2P'";
        this.ctx.fillText(this.scoreL, this.canvas.width / 4, 100); // Left player score
        this.ctx.fillText(this.scoreR, 3 * this.canvas.width / 4, 100); // Right player score
    }

    resetScore() {
        this.scoreL = 0;
        this.scoreR = 0;
    }

    updateScoreToWin() {
        
    }
}
