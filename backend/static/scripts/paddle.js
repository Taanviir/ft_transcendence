// paddle.js

import { PADDLE_SPEED as DEFAULT_PADDLE_SPEED } from './pong.js';

//TODO: implement paddle height

export const PaddleTypes = Object.freeze({
    LEFT1: 'LEFT_PLAYER_1',
    RIGHT1: 'RIGHT_PLAYER_1',
    LEFT2: 'LEFT_PLAYER_2',
    RIGHT2: 'RIGHT_PLAYER_2'
});

export class Paddle {
    constructor(paddleType, canvas, ctx) {
        this.paddleType = paddleType;
        this.canvas = canvas;
        this.ctx = ctx;

        this.paddleWidth = this.canvas.width / 50;
        this.paddleHeight = this.canvas.height / 8;

        this.resetPosition();
    }

    up(ball) {
        if (this.y - DEFAULT_PADDLE_SPEED < 0)
            this.y = 0; // Prevent paddle from going out of bounds
        else
            this.y -= DEFAULT_PADDLE_SPEED; // Move paddle up

        if (ball.collision(this))
            this.y += DEFAULT_PADDLE_SPEED;
    }

    down(ball) {
        if (this.y + DEFAULT_PADDLE_SPEED + this.paddleHeight > this.canvas.height)
            this.y = this.canvas.height - this.paddleHeight; // Prevent paddle from going out of bounds
        else
            this.y += DEFAULT_PADDLE_SPEED; // Move paddle down

        if (ball.collision(this))
            this.y -= DEFAULT_PADDLE_SPEED;
    }

    updateSpeed(newSpeed) {
        if (newSpeed > 0)
            this.speed = newSpeed;
        else
            console.error('Invalid speed value:', newSpeed);
    }

    drawPaddle(color) {
        const colors = {
            [PaddleTypes.LEFT1]: color,
            [PaddleTypes.RIGHT1]: color,
            [PaddleTypes.LEFT2]: 'red',
            [PaddleTypes.RIGHT2]: 'red',
        };

        this.ctx.fillStyle = colors[this.paddleType];
        this.ctx.fillRect(this.x, this.y, this.paddleWidth, this.paddleHeight);
    }

    resetPosition() {
        const canvasMiddleY = this.canvas.height / 2.5;

        const positions = {
            [PaddleTypes.LEFT1]: { x: 2, y: canvasMiddleY },
            [PaddleTypes.RIGHT1]: { x: this.canvas.width - this.paddleWidth - 2, y: canvasMiddleY },
            [PaddleTypes.LEFT2]: { x: this.paddleWidth + 5, y: canvasMiddleY },
            [PaddleTypes.RIGHT2]: { x: this.canvas.width - this.paddleWidth * 2 - 5, y: canvasMiddleY },
        };

        const { x, y } = positions[this.paddleType];
        this.x = x;
        this.y = y;
    }
}
