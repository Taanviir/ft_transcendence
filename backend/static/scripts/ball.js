// ball.js

import { BALL_SPEED } from './pong.js';

//TODO: fix collision issues

export class Ball {
    constructor(canvas, ctx, score, paddles, ballRadius) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.ballMoving = false;
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        this.dx = 0;
        this.dy = 0;
        this.angleX = 0.0;
        this.angleY = 0.0;
        this.ballRadius = ballRadius;

        this.paddles = paddles;
        this.score = score;
        this.sound = document.createElement("audio");
        this.initializeSound('../static/sound/bounce.mp3');
    }

    initializeSound(src) {
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
    }

    updateSpeed(newSpeed) {
        if (newSpeed > 0) {
            this.dx = this.angleX * newSpeed;
            this.dy = this.angleY * newSpeed;
        }
        else
            console.error('Invalid speed value:', newSpeed);
    }

    draw(color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2, false);
        this.ctx.fill();
        this.ctx.closePath();
    }

    ballStartAngle() {
        let min = -0.5;
        let max = 0.5;
        let angle = Math.random() * (max - min) + min;
        if (angle < 0.15 && angle > -0.15) {
            angle = 0.15;
        }
        return angle;
    }

    ballResetPosition() {
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
    }

    startBallMovement() {
        this.angleX = this.ballStartAngle();
        this.angleY = this.ballStartAngle();
        this.dx = this.angleX * BALL_SPEED;
        this.dy = this.angleY * BALL_SPEED;
        this.ballMoving = true;
    }

    resumeBallMovement() {
        this.dx = this.angleX * BALL_SPEED;
        this.dy = this.angleY * BALL_SPEED;
        this.ballMoving = true;
    }

    doLinesIntersect(line1, line2) {
        // Unpack the lines into points
        const [p1, p2] = line1;
        const [p3, p4] = line2;

        // Calculate the determinant
        const det = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);

        if (det === 0) // Lines are parallel
            return false;

        // Calculate the parameters
        const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
        const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

        // Check if the intersection point lies on both line segments
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }

    ballColisionLeftPaddelTopLine(paddle) {
        let ballPositionDown = [{ x: this.ballX, y: this.ballY }, { x: this.ballX, y: this.ballY + this.dy + this.ballRadius }];
        //TOP line of the paddle
        let line1 = [{ x: paddle.x, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y }];
        //this.drawLine(line1[0].x, line1[0].y,line1[1].x, line1[1].y)
        //this.drawLine('red',ballPositionDown[0].x, ballPositionDown[0].y,ballPositionDown[1].x, ballPositionDown[1].y)
        //this.drawLine('red',line1[0].x, line1[0].y,line1[1].x, line1[1].y)
        if (this.doLinesIntersect(ballPositionDown, line1)) {
            this.dy = -this.dy;
            return true;
        }
        return false;
    }

    ballColisionLeftPaddelRightLineInDownLeftPartOfBall(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX - Math.sin(45) * this.ballRadius + this.dx, y: this.ballY + Math.cos(45) * this.ballRadius + this.dy }];
        let linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('gray',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
        //this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
            this.dx = -this.dx;
            this.dy = -this.dy;
            return true;
        }
        return false;
    }

    ballColisionLeftPaddelRightLineInUpLeftPartOfBall(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX - Math.sin(45) * this.ballRadius + this.dx, y: this.ballY - Math.cos(45) * this.ballRadius + this.dy }];
        let linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('green',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
        //this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
            this.dx = -this.dx;
            this.dy = -this.dy;
            return true;
        }
        return false;
    }

    ballColisionLeftPaddelLeftLineInUpRightPartOfBall(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY - Math.cos(45) * this.ballRadius + this.dy }];
        let linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('brown',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
        //this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
            this.dx = -this.dx;
            this.dy = -this.dy;
            return true;
        }
        return false;
    }

    ballColisionLeftPaddelBottomLineInUpRightPartOfBall(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY - Math.cos(45) * this.ballRadius + this.dy }];
        let linePaddelBottom = [{ x: paddle.x, y: paddle.y + paddle.paddleHeight }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('brown',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
        //this.drawLine('gray', linePaddelBottom[0].x, linePaddelBottom[0].y, linePaddelBottom[1].x, linePaddelBottom[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelBottom)) {
            this.dx = -this.dx;
            this.dy = -this.dy;
            return true;
        }
        return false;
    }


    ballColisionLeftPaddelLeftLineInDownRightPartOfBall(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY + Math.cos(45) * this.ballRadius + this.dy }];
        let linePaddelRight = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('red',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
        //this.drawLine('green', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
            this.dx = -this.dx;
            // this.dy = -this.dy;
            return true;
        }
        return false;
    }


    ballColisionLeftPaddelTopLineInDownRightPartOfBall(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY + Math.cos(45) * this.ballRadius + this.dy }];
        let linePaddelTop = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('red',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
        //this.drawLine('green', linePaddelTop[0].x, linePaddelTop[0].y, linePaddelTop[1].x, linePaddelTop[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelTop)) {
            this.dx = -this.dx;
            this.dy = -this.dy;
            return true;
        }
        return false;
    }


    ballCollisionLeftPaddelRightLine(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy - this.ballRadius }];
        //Right line of the paddle
        let linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('yellow',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
        //this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
            this.dx = -this.dx;
            return true;
        }
        return false;
    }

    ballCollisionLeftPaddelLeftLine(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy - this.ballRadius }];
        //Right line of the paddle
        let linePaddelLeft = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
        // this.drawLine('pink',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
        //this.drawLine('gray', linePaddelLeft[0].x, linePaddelLeft[0].y, linePaddelLeft[1].x, linePaddelLeft[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelLeft)) {
            this.dx = -this.dx;
            return true;
        }
        return false;
    }

    ballCollisionLeftPaddelBottomLine(paddle) {
        let ballPositionUp = [{ x: this.ballX, y: this.ballY }, { x: this.ballX, y: this.ballY + this.dy - this.ballRadius }];
        //BOTTOM line of the paddle
        let lineBottom = [{ x: paddle.x, y: paddle.y + paddle.paddleHeight }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('blue',ballPositionUp[0].x, ballPositionUp[0].y,ballPositionUp[1].x, ballPositionUp[1].y)
        //this.drawLine('gray', lineBottom[0].x, lineBottom[0].y, lineBottom[1].x, lineBottom[1].y)
        if (this.doLinesIntersect(ballPositionUp, lineBottom)) {
            this.dy = -this.dy;
            return true;
        }
        return false;
    }

    //Right paddle
    ballCollisionRightPaddelRightLine(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy + this.ballRadius }];
        //Right line of the paddle
        let linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
            this.dx = -this.dx;
            return true;
        }
        return false;
    }

    ballCollisionRightPaddelLeftLine(paddle) {
        let ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy + this.ballRadius }];
        //Right line of the paddle

        let linePaddelLeft = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
        //this.drawLine('gray', linePaddelLeft[0].x, linePaddelLeft[0].y, linePaddelLeft[1].x, linePaddelLeft[1].y)
        if (this.doLinesIntersect(ballPosition, linePaddelLeft)) {
            this.dx = -this.dx;
            return true;
        }
        return false;
    }

    collision(paddle) {
        if (!this.ballColisionLeftPaddelTopLine(paddle)) {
            if (!this.ballCollisionLeftPaddelRightLine(paddle)) {
                if (!this.ballCollisionLeftPaddelBottomLine(paddle)) {
                    if (!this.ballCollisionLeftPaddelLeftLine(paddle)) {
                        if (!this.ballColisionLeftPaddelRightLineInDownLeftPartOfBall(paddle)) {
                            if (!this.ballColisionLeftPaddelRightLineInUpLeftPartOfBall(paddle)) {
                                if (!this.ballColisionLeftPaddelLeftLineInUpRightPartOfBall(paddle)) {
                                    if (!this.ballColisionLeftPaddelLeftLineInDownRightPartOfBall(paddle)) {
                                        if (!this.ballColisionLeftPaddelBottomLineInUpRightPartOfBall(paddle)) {
                                            if (!this.ballColisionLeftPaddelTopLineInDownRightPartOfBall(paddle)) {
                                                return false;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.sound.play();
        return true;
    }

    ballMove() {
        this.ballRadius = this.ballRadius;
        if (this.ballMoving) {
            // top and bottom wall collision
            if (this.ballY + this.dy + this.ballRadius > this.canvas.height ||
                this.ballY + this.dy - this.ballRadius < 0) {
                this.dy = -this.dy;
                this.sound.play();
            }

            // Loop through the paddles array and check for collisions
            this.paddles.forEach(paddle => this.collision(paddle));

            this.ballX += this.dx;
            this.ballY += this.dy;

            this.updateScore();
        }
    }

    updateScore() {
        if (this.ballX < 0) { // Right player scored
            this.score.incrementScoreR();
            this.ballMoving = false;
            if (this.score.checkGameOver() === false) {
                this.ballResetPosition();
                this.startBallMovement();
            }
        }

        if (this.ballX > this.canvas.width) { // Left player scored
            this.score.incrementScoreL();
            this.ballMoving = false;
            if (this.score.checkGameOver() === false) {
                this.ballResetPosition();
                this.startBallMovement();
            }
        }
    }
}
