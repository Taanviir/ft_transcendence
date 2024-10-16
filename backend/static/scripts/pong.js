let canvas = null;
let ctx = null;
let game = null;

// Global variables for the game configuration
const gameConfig = {
    "Easy": { paddleSpeed: 15, ballSpeed: 7 },
    "Medium": { paddleSpeed: 30, ballSpeed: 15 },
    "Hard": { paddleSpeed: 66, ballSpeed: 33 },
    "Visual Impaired": { paddleSpeed: 15, ballSpeed: 10 }
};

var g_PADDLE_SPEED = 10;
var g_BALL_SPEED = 15;
var g_SOUND = true;
var g_SCORE_TO_WIN = 5;
var g_CURRENT_LEVEL = "Medium";
var g_fillColor = 'black';
var g_ballRadius;
var g_ballColor = 'white';
var g_paddleWidth;
var g_paddleHeight;

const PaddleTypes = Object.freeze({
	LEFT1:	1,
	RIGHT1:	2,
	LEFT2:	3,
	RIGHT2:	4,
});

class Ball {
	constructor(score, nbPlayers, paddle1, paddle2, paddle3, paddle4) {
		this.width = canvas.width;
		this.height = canvas.height;
		this.ballMoving = false;
		this.ballX = this.width / 2; // X position of the ball
		this.ballY = this.height / 2; // Y position of the ball
		this.dx = 0; // Change in x direction
		this.dy = 0; // Change in y direction
		this.paddle1 = paddle1;
		this.paddle2 = paddle2;
		this.paddle3 = paddle3;
		this.paddle4 = paddle4;
		this.nbPlayers = nbPlayers;
		this.ballRadius = canvas.width / 100;
		g_ballRadius = this.ballRadius;
		this.score = score;
		this.sound = new Sound("../static/sound/bounce.mp3");
		this.angleX = 0.0;
		this.angleY = 0.0;
	}

	drawBall() {
		ctx.fillStyle = g_ballColor;
		ctx.beginPath();
		ctx.arc(this.ballX, this.ballY, g_ballRadius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.closePath();
	}

	ballStartAngle() {
		var min = -0.5;
		var max = 0.5;
		var angle = Math.random() * (max - min) + min;
		if (angle < 0.15 && angle > -0.15) {
			angle = 0.15;
		}
		return angle;
	}

	ballResetPosition() {
		this.ballX = this.width / 2;
		this.ballY = this.height / 2;
	}

	startBallMovement() {
		this.angleX = this.ballStartAngle();
		this.angleY = this.ballStartAngle();
		this.dx = this.angleX * g_BALL_SPEED; // Initialize dx based on random angle
		this.dy = this.angleY * g_BALL_SPEED; // Initialize dy based on random angle
		this.ballMoving = true; // Set flag to true to start movement
	}

	resumeBallMovement() {
		this.dx = this.angleX * g_BALL_SPEED; // Update the speed
		this.dy = this.angleY * g_BALL_SPEED; // Update the speed
		this.ballMoving = true;
	}

	doLinesIntersect(line1, line2) {
		// Unpack the lines into points
		const [p1, p2] = line1;
		const [p3, p4] = line2;

		// Calculate the determinant
		const det = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);

		if (det === 0) {
			// The lines are parallel
			return false;
		}

		// Calculate the parameters
		const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
		const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

		// Check if the intersection point lies on both line segments
		return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
	}

    //  Left Paddel
    //               ***
    //   ###       *  |   *
    //   * *      *______ *
    //   * *       *DL|  *
    //   * *      /  ***
    //   * *
    //   ***
    //      Top line of the paddel
	ballColisionLeftPaddelTopLine(paddle) {
		var ballPositionDown = [{ x: this.ballX, y: this.ballY }, { x: this.ballX, y: this.ballY + this.dy + this.ballRadius }];
		//TOP line of the paddle
		var line1 = [{ x: paddle.x, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y }];
		//this.drawLine(line1[0].x, line1[0].y,line1[1].x, line1[1].y)
		//this.drawLine('red',ballPositionDown[0].x, ballPositionDown[0].y,ballPositionDown[1].x, ballPositionDown[1].y)
		//this.drawLine('red',line1[0].x, line1[0].y,line1[1].x, line1[1].y)
		if (this.doLinesIntersect(ballPositionDown, line1)) {
			console.log("intercept paddel1 TOP line");
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

    //  Left Paddel
    //               ***
    //   **#       *  |   *
    //   * #      *______ *
    //   * #       *DL|  *
    //   * #      /  ***
    //   * #
    //   **#
    //      Right line of the paddel
	ballColisionLeftPaddelRightLineInDownLeftPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX - Math.sin(45) * this.ballRadius + this.dx, y: this.ballY + Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('gray',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line DL dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

    //  Left Paddel
    //               ***
    //   **#      \*UL|   *
    //   * #      *______ *
    //   * #       *  |  *
    //   * #         ***
    //   * #
    //   **#
    //      Right line of the paddel
	ballColisionLeftPaddelRightLineInUpLeftPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX - Math.sin(45) * this.ballRadius + this.dx, y: this.ballY - Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('green',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line UL dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

    //  Left Paddel
    //               ***  /
    //   #**       *  |UR*
    //   # *      *______ *
    //   # *       *  |  *
    //   # *         ***
    //   # *
    //   #**
    //      Left line of the paddel
	ballColisionLeftPaddelLeftLineInUpRightPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY - Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('brown',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line UL dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

    //  Left Paddel
    //               ***  /
    //   ***       *  |UR*
    //   * *      *______ *
    //   * *       *  |  *
    //   * *         ***
    //   * *
    //   ###
    //      Bottom line of the paddel
	ballColisionLeftPaddelBottomLineInUpRightPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY - Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelBottom = [{ x: paddle.x, y: paddle.y + paddle.paddleHeight }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('brown',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelBottom[0].x, linePaddelBottom[0].y, linePaddelBottom[1].x, linePaddelBottom[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelBottom)) {
			console.log("intercept paddel1 BOTTOM line UR dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}


    //  Left Paddel ******************
    //               ***
    //   #**       *  |   *
    //   # *      *______ *
    //   # *       *  | DR*
    //   # *         ***   \
    //   # *
    //   #**
    //      Right line of the paddel
	ballColisionLeftPaddelLeftLineInDownRightPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY + Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelRight = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('red',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('green', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 LEFT line DR dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			// this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}


    //  Left Paddel ******************
    //               ***
    //   ###       *  |   *
    //   * *      *______ *
    //   * *       *  | DR*
    //   * *         ***   \
    //   * *
    //   ***
    //      Top line of the paddel
	ballColisionLeftPaddelTopLineInDownRightPartOfBall(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + Math.sin(45) * this.ballRadius + this.dx, y: this.ballY + Math.cos(45) * this.ballRadius + this.dy }];
		var linePaddelTop = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('red',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('green', linePaddelTop[0].x, linePaddelTop[0].y, linePaddelTop[1].x, linePaddelTop[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelTop)) {
			console.log("intercept paddel1 TOP line DR dx " + this.dx + " dy " + this.dy);
			this.dx = -this.dx;
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}


	ballCollisionLeftPaddelRightLine(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy - this.ballRadius }];
		//Right line of the paddle
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('yellow',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line");
			this.dx = -this.dx;
			this.sound.play();
			return true;
		}
		return false;
	}

	ballCollisionLeftPaddelLeftLine(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy - this.ballRadius }];
		//Right line of the paddle
		var linePaddelLeft = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
		// this.drawLine('pink',ballPosition[0].x, ballPosition[0].y,ballPosition[1].x, ballPosition[1].y)
		//this.drawLine('gray', linePaddelLeft[0].x, linePaddelLeft[0].y, linePaddelLeft[1].x, linePaddelLeft[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelLeft)) {
			console.log("intercept paddel1 RIGHT line");
			this.dx = -this.dx;
			this.sound.play();
			return true;
		}
		return false;
	}

	ballCollisionLeftPaddelBottomLine(paddle) {
		var ballPositionUp = [{ x: this.ballX, y: this.ballY }, { x: this.ballX, y: this.ballY + this.dy - this.ballRadius }];
		//BOTTOM line of the paddle
		var lineBottom = [{ x: paddle.x, y: paddle.y + paddle.paddleHeight }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('blue',ballPositionUp[0].x, ballPositionUp[0].y,ballPositionUp[1].x, ballPositionUp[1].y)
		//this.drawLine('gray', lineBottom[0].x, lineBottom[0].y, lineBottom[1].x, lineBottom[1].y)
		if (this.doLinesIntersect(ballPositionUp, lineBottom)) {
			console.log("intercept paddel1 TOP line");
			this.dy = -this.dy;
			this.sound.play();
			return true;
		}
		return false;
	}

	//Right paddle
	ballCollisionRightPaddelRightLine(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy + this.ballRadius }];
		//Right line of the paddle
		var linePaddelRight = [{ x: paddle.x + paddle.paddleWidth, y: paddle.y }, { x: paddle.x + paddle.paddleWidth, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('gray', linePaddelRight[0].x, linePaddelRight[0].y, linePaddelRight[1].x, linePaddelRight[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelRight)) {
			console.log("intercept paddel1 RIGHT line");
			this.dx = -this.dx;
			this.sound.play();
			return true;
		}
		return false;
	}

	ballCollisionRightPaddelLeftLine(paddle) {
		var ballPosition = [{ x: this.ballX, y: this.ballY }, { x: this.ballX + this.dx - this.ballRadius, y: this.ballY + this.dy + this.ballRadius }];
		//Right line of the paddle

		var linePaddelLeft = [{ x: paddle.x, y: paddle.y }, { x: paddle.x, y: paddle.y + paddle.paddleHeight }];
		//this.drawLine('gray', linePaddelLeft[0].x, linePaddelLeft[0].y, linePaddelLeft[1].x, linePaddelLeft[1].y)
		if (this.doLinesIntersect(ballPosition, linePaddelLeft)) {
			console.log("intercept paddel1 RIGHT line");
			this.dx = -this.dx;
			this.sound.play();
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
		return true;
	}

	ballMove() {
		this.ballRadius = g_ballRadius;
		if (this.ballMoving) {
			// top and bottom wall collision
			if (this.ballY + this.dy + this.ballRadius > canvas.height ||
                this.ballY + this.dy - this.ballRadius < 0) {
				this.dy = -this.dy;
				this.sound.play();
			}

			this.collision(this.paddle1);
			this.collision(this.paddle2);
			if (this.nbPlayers === 4) {
				this.collision(this.paddle3);
				this.collision(this.paddle4);
			}
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

		if (this.ballX > canvas.width) { // Left player scored
			this.score.incrementScoreL();
			this.ballMoving = false;
			if (this.score.checkGameOver() === false) {
				this.ballResetPosition();
				this.startBallMovement();
			}
		}
	}
}

class Paddle {
    constructor(paddleType) {
        this.paddleType = paddleType;
        this.width = canvas.width; // Canvas width in pixels
        this.height = canvas.height; // Canvas height in pixels
        this.paddleWidth = this.width / 50;
        this.paddleHeight = this.height / 8;
        g_paddleWidth = this.width / 50;
        g_paddleHeight = this.height / 8;

        this.resetPosition();
        this.ballRef = null;
    }

	setBallRef(ballRef) {
		this.ballRef = ballRef;
	}

    up() {
        if (this.y - g_PADDLE_SPEED < 0)
            this.y = 0; // Prevent paddle from going out of bounds
        else
            this.y -= g_PADDLE_SPEED; // Move paddle up

        if (this.ballRef.collision(this))
            this.y += g_PADDLE_SPEED;
    }

	// Check if the paddle is not at the bottom of the canvas
    down() {
        if (this.y + g_PADDLE_SPEED + this.paddleHeight > this.height)
            this.y = this.height - this.paddleHeight; // Prevent paddle from going out of bounds
        else
            this.y += g_PADDLE_SPEED; // Move paddle down

        if (this.ballRef.collision(this))
            this.y -= g_PADDLE_SPEED;
    }

	drawPaddle() {
        if (this.paddleHeight != g_paddleHeight) {
            this.paddleHeight = g_paddleHeight;
            this.paddleWidth = g_paddleWidth;
            this.resetPosition();
        }

        ctx.fillStyle = 'white'; // Fill color players 1 and 2
        if (this.paddleType === PaddleTypes.LEFT2 || this.paddleType === PaddleTypes.RIGHT2)
            ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.paddleWidth, this.paddleHeight);
	}

	resetPosition() {
		if (this.paddleType == PaddleTypes.LEFT1) {
			this.x = 2;
			this.y = this.height / 2.5;
		}
		if (this.paddleType == PaddleTypes.RIGHT1) {
			this.x = this.width - 2 - this.paddleWidth;
			this.y = this.height / 2.5;
		}
		if (this.paddleType == PaddleTypes.LEFT2) {
			this.x = this.paddleWidth + 2 + 3;
			this.y = this.height / 2.5;
		}
		if (this.paddleType == PaddleTypes.RIGHT2) {
			this.x = this.width - 5 - this.paddleWidth - this.paddleWidth;
			this.y = this.height / 2.5;
		}
	}
}

class Pong {
	constructor(nbPlayers, isTournament = false, notifyWinner = null) {
		// Get canvas attributes
		this.width = canvas.width; // Canvas width in pixels
		this.height = canvas.height; // Canvas height in pixels
		this.nbPlayers = nbPlayers;
		this.paddle1 = new Paddle(PaddleTypes.LEFT1);
		this.paddle2 = new Paddle(PaddleTypes.RIGHT1);
		this.score = new Score();
		this.countdown = new Countdown(this);
		this.notifyWinner = notifyWinner;
		this.isTournament = isTournament;
		this.isGameRunning = false;

		if (this.nbPlayers === 4) {
			this.paddle3 = new Paddle(PaddleTypes.LEFT2);
			this.paddle4 = new Paddle(PaddleTypes.RIGHT2);
			this.ball = new Ball(this.score, 4, this.paddle1, this.paddle2, this.paddle3, this.paddle4);
			this.paddle1.setBallRef(this.ball);
			this.paddle2.setBallRef(this.ball);
			this.paddle3.setBallRef(this.ball);
			this.paddle4.setBallRef(this.ball);
		}
		else {
			this.ball = new Ball(this.score, 2, this.paddle1, this.paddle2);
			this.paddle1.setBallRef(this.ball);
			this.paddle2.setBallRef(this.ball);
		}
		this.intervalId = 0;

        this.keys = {};
	}

	initialDisplay() {
		ctx.font = "72px 'Press Start 2P'";
		var textWidth = ctx.measureText("PONG").width;
		ctx.fillText("PONG", (canvas.width / 2) - (textWidth / 2), (canvas.height / 2) - 100);
		ctx.font = "32px 'Press Start 2P'";
		var textWidth1 = ctx.measureText("Press Enter to Start or").width;
		var textWidth2 = ctx.measureText("Select Visual Impairment Mode").width;
		ctx.fillText("Press Enter to Start or", (canvas.width / 2) - (textWidth1 / 2), (canvas.height / 2) + 100);
		ctx.fillText("Select Visual Impairment Mode", (canvas.width / 2) - (textWidth2 / 2), (canvas.height / 2 + 100) + 100);
	}

	start() {
		this.paddle1.resetPosition();
		this.paddle2.resetPosition();
		if (this.nbPlayers === 4) {
			this.paddle3.resetPosition();
			this.paddle4.resetPosition();
		}
		this.render();
		this.initialDisplay();
		const handleEnter = (event) => {
			if (event.key === 'Enter') {
				this.countdown.start();
				this.isGameRunning = true;
				document.removeEventListener('keydown', handleEnter);
			}
		};
		document.addEventListener('keydown', handleEnter);
	}

	startGame() {
		this.score.resetScore();
        this.ball.ballResetPosition();
		document.addEventListener('keydown', this.handleKeyboardEvent.bind(this));
        document.addEventListener('keyup', this.handleKeyboardEvent.bind(this));
        this.intervalId = setInterval(this.pongRender.bind(this), 1000 / 60); // 60 FPS (frames per second)
		this.ball.startBallMovement();
	}

	pause() {
		clearInterval(this.intervalId);
	}

	resume() {
		this.ball.resumeBallMovement();
		this.intervalId = setInterval(this.pongRender.bind(this), 1000 / 60);
	}

	stop() {
		clearInterval(this.intervalId);
		document.removeEventListener('keydown', this.handleKeyboardEvent.bind(this));
        document.removeEventListener('keyup', this.handleKeyboardEvent.bind(this));
		this.isGameRunning = false;
	}

	reset() {
		this.stop();
		this.score.resetScore();
	}

	drawSquare() {
		ctx.fillStyle = g_fillColor; // Original fill color is black
		ctx.fillRect(0, 0, this.width, this.height); // Draw a rectangle (x, y, width, height)

		ctx.strokeStyle = 'white'; // Line color
		ctx.lineWidth = 2; // line Width
		ctx.setLineDash([6, 3]); // LineDash: 6px and 3px space
		ctx.beginPath();
		ctx.moveTo(this.width / 2, 0); // Line initial point
		ctx.lineTo(this.width / 2, this.height); //  Line final point
		ctx.stroke(); // Apply line stile and draw
	}

	drawControlText(line) {
		// Set text style
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = 'white';

		// Define the starting y position for the first line of text
		lineHeight = fontSize * 0.8; // Space between lines
		let startY = canvasHeight / 2 - (lineHeight * (textLines.length - 0.8)) / 2;
		ctx.fillText(line, canvasWidth / 2, startY);

	}

	displayWinner() {
		var element = document.getElementById('winner');

		if (this.score.scoreL == g_SCORE_TO_WIN) {
			element.innerText = "Left Player wins!";
		}
		else {
			element.innerText = "Right Player wins!";
		}
		var myModal = new bootstrap.Modal(document.getElementById('winnerpopup'));
		myModal.show();
	}

	render() {
		this.drawSquare();
		this.paddle1.drawPaddle();
		this.paddle2.drawPaddle();
		if (this.nbPlayers === 4) {
			this.paddle3.drawPaddle();
			this.paddle4.drawPaddle();
		}
		this.score.drawScore();
		this.ball.drawBall();
	}

	getWinner() {
		if (this.score.scoreL == g_SCORE_TO_WIN) {
			return ("left");
		}
		else {
			return ("right");
		}
	}

	pongRender() {
        this.render();
        this.ball.ballMove(); // Move the ball
        this.updatePaddles(); // Update the paddles asynchronously

        if (this.score.checkGameOver() === true) {
            if (this.isTournament === false)
                this.displayWinner();
            else
                this.notifyWinner(this.getWinner());
            this.stop();
            this.render();
        }
    }

    handleKeyboardEvent(event) {
        if (event.type === 'keydown')
            this.keys[event.key] = true;
        else if (event.type === 'keyup')
            this.keys[event.key] = false;
    }

    updatePaddles() {
        if (this.keys['q']) this.paddle1.up();
        if (this.keys['a']) this.paddle1.down();
        if (this.keys['p']) this.paddle2.up();
        if (this.keys['l']) this.paddle2.down();

        // Handle additional paddles for 4 players
        if (this.nbPlayers === 4) {
            if (this.keys['d']) this.paddle3.up();
            if (this.keys['c']) this.paddle3.down();
            if (this.keys['j']) this.paddle4.up();
            if (this.keys['n']) this.paddle4.down();
        }
    }
}

class Score {
	constructor() {
		this.scoreL = 0;
		this.scoreR = 0;
	}

	incrementScoreR() {
		this.scoreR++;
	}

	incrementScoreL() {
		this.scoreL++;
	}

	checkGameOver() {
		if (this.scoreL === g_SCORE_TO_WIN || this.scoreR === g_SCORE_TO_WIN) {
			return true;
		}
		return false;
	}

    drawScore() {
        ctx.fillStyle = 'white';
        ctx.font = "72px 'Press Start 2P'";
        ctx.fillText(this.scoreL, canvas.width / 4, 100); // Left player score
        ctx.fillText(this.scoreR, 3 * canvas.width / 4, 100); // Right player score
    }

	resetScore() {
		this.scoreL = 0;
		this.scoreR = 0;
	}
}

class Sound {
	constructor(src) {
		this.sound = document.createElement("audio");
		this.sound.src = src;
		this.sound.setAttribute("preload", "auto");
		this.sound.setAttribute("controls", "none");
		this.sound.style.display = "none";
		document.body.appendChild(this.sound);
	}

	play() {
		if (g_SOUND)
			this.sound.play();
	}
}

class Countdown {
	constructor(pong) {
		this.pong = pong;
		this.count = 3;
		this.intervalId = 0;
	}

	start() {
		this.count = 3;
		this.drawCountdown();
		this.intervalId = setInterval(this.countdown.bind(this), 1000);
	}

	countdown() {
		if (this.count === 1) {
			clearInterval(this.intervalId);
			setTimeout(() => {
				this.pong.startGame();
			}, 200);
		}
		else {
			this.count--;
			this.drawCountdown();
		}
	}

	drawCountdown() {
		this.pong.render();
		ctx.font = "280px 'Press Start 2P'";
		ctx.fillStyle = 'red';
		var textWidth = ctx.measureText(this.count).width;
		ctx.fillText(this.count, (canvas.width / 2) - (textWidth / 2), (canvas.height / 2) + (textWidth / 2));
	}
}

class Game {
	constructor(isTournament, players) {
		this.isTournament = isTournament;
		if (this.isTournament == true)
			this.tournament = new Tournament(players);
		else
			this.pong = new Pong(players.length);

		if (isTournament === true || players.length == 2) {
			document.getElementById('3rdplayer').style.display = 'none';
			document.getElementById('4thplayer').style.display = 'none';
		}
	}

	start() {
		if (this.isTournament == true) {
			this.tournament.startTournament();
		}
		else {
			this.pong.start();
		}
	}

	reset() {
		if (this.isTournament == true) {
			this.tournament.resetTournament();
		}
		else {
			this.pong.reset();
		}
	}

	isGameRunning() {
		if (this.isTournament == true) {
			return (this.tournament.pong.isGameRunning);
		}
		else {
			return (this.pong.isGameRunning);
		}
	}

	forceRefresh() {
		if (this.isTournament == true) {
			this.tournament.pong.render();
		}
		else {
			this.pong.render();
		}
	}

	pause() {
		if (this.isTournament == true) {
			this.tournament.pong.pause();
		}
		else {
			this.pong.pause();
		}
	}

	resume() {
		if (this.isGameRunning() == true) {
			if (this.isTournament == true) {
				this.tournament.pong.resume();
			}
			else {
				this.pong.resume();
			}
		}
	}
}

function playAgain() {
	game.reset();
	game.start();
	document.getElementById("ponggame").focus();
}

function refreshConfig() {
	document.getElementById('playerspeed').value = g_PADDLE_SPEED;
	document.getElementById('ballspeed').value = g_BALL_SPEED;
	document.getElementById('score').value = g_SCORE_TO_WIN;
	document.getElementById('customSwitch').checked = g_SOUND;
	document.getElementById('currentScore').innerText = "Score - " + g_SCORE_TO_WIN;
}

function loadConfiguration() {
	if (game.isGameRunning() == true)
		document.getElementById('score').disabled = true;
	else
		document.getElementById('score').disabled = false;
	game.pause();
	refreshConfig();
}

function applyConfiguration() {
	g_PADDLE_SPEED = parseInt(document.getElementById('playerspeed').value, 10);
	g_BALL_SPEED = parseInt(document.getElementById('ballspeed').value, 10);
	g_SCORE_TO_WIN = parseInt(document.getElementById('score').value, 10);
	g_SOUND = document.getElementById('customSwitch').checked;
	game.resume();
	document.getElementById("ponggame").focus();
}

class Tournament {
    // player1 will be the logged user
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

	// lambda =>
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
			if (this.semiFinalWinner1 == "") {
				this.semiFinalWinner1 = this.winner;
			}
			else {
				this.semiFinalWinner2 = this.winner;
			}
		}
		if (this.isFinalGame == true) {
			var myModal = new bootstrap.Modal(document.getElementById('winnerFinalpopup'));
			myModal.show();
		}
		else {
			var myModal = new bootstrap.Modal(document.getElementById('winnerTpopup'));
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
		ctx.fillRect(0, 0, canvas.width, canvas.height); // Draw a rectangle (x, y, width, height)
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

function nextGame() {
	game.tournament.nextMatch();
}

function setupDropdownListeners() {
    const modal = document.getElementById('configModal');
    const dropdownMenu = modal.querySelector('.dropdown-menu');

    dropdownMenu.addEventListener('click', (event) => {
        const selectedItem = event.target.closest('.dropdown-item');
        if (selectedItem) {
            event.preventDefault();

            const selectedText = selectedItem.textContent.trim();
            const dropdownButton = modal.querySelector('.dropdown-toggle');
            dropdownButton.textContent = selectedText;

            if (selectedText in gameConfig) {
                g_PADDLE_SPEED = gameConfig[selectedText].paddleSpeed;
                g_BALL_SPEED = gameConfig[selectedText].ballSpeed;
            }
            else if (selectedText === "Custom")
                document.getElementById("customConfig").style.display = "block";
            else
                console.error('Invalid difficulty level selected');

            // Hide the dropdown menu after selection
            const dropdown = new bootstrap.Dropdown(dropdownButton);
            dropdown.hide();
        }
    });
}

function visual() {
    if (game.isGameRunning() == true) {
        var myModal = new bootstrap.Modal(document.getElementById('visualmodal'));
        myModal.show();
        return;
    }

    if (g_fillColor === 'black') {
        g_fillColor = 'blue';
        g_ballRadius = canvas.width / 40;
        g_ballColor = 'yellow';
        g_paddleHeight = canvas.height / 4;
        g_paddleWidth = canvas.width / 25;
    }
    else {
        g_fillColor = 'black'
        g_ballRadius = canvas.width / 100;
        g_ballColor = 'white';
        g_paddleHeight = canvas.height / 8;
        g_paddleWidth = canvas.width / 50;
    }

    game.forceRefresh();
}

function askForPlayerNames(numOfPlayers, isLoggedIn, loggedInUsername = '') {
    let playerNames = [];
    const playerNameModal = new bootstrap.Modal(document.getElementById('playerNameModal'));
    const playerForm = document.getElementById('playerNamesForm');

    const playerInputs = [
        { divId: 'player1Div', inputId: 'player1', visible: !isLoggedIn },
        { divId: 'player2Div', inputId: 'player2', visible: true },
        { divId: 'player3Div', inputId: 'player3', visible: numOfPlayers === 4 },
        { divId: 'player4Div', inputId: 'player4', visible: numOfPlayers === 4 },
    ];
    playerInputs.forEach(({ divId, visible }) => {
        document.getElementById(divId).style.display = visible ? 'block' : 'none';
    });

    if (isLoggedIn) {
        document.getElementById('player1').value = loggedInUsername;
        playerNames.push(loggedInUsername);
    }

    playerNameModal.show();

    document.getElementById('startGameButton').addEventListener('click', (event) => {
        event.preventDefault();

        playerForm.classList.remove('was-validated');

        let allValid = true;
        playerInputs.forEach(({ inputId, visible }) => {
            if (visible) {
                const inputField = document.getElementById(inputId);
                if (inputField.checkValidity())
                    inputField.classList.remove('is-invalid');
                else {
                    allValid = false;
                    inputField.classList.add('is-invalid');
                }
            }
        });

        playerForm.classList.add('was-validated');

        if (!allValid)
            return;

        playerInputs.forEach(({ inputId, visible }) => {
            if (visible) {
                const playerName = document.getElementById(inputId).value.trim();
                if (playerName) playerNames.push(playerName);
            }
        });

        playerNameModal.hide();

		document.getElementById('player1name').innerText = playerNames[0].length > 5 ? playerNames[0].slice(0, 5) + '.' : playerNames[0];
		document.getElementById('player2name').innerText = playerNames[1].length > 5 ? playerNames[1].slice(0, 5) + '.' : playerNames[1];
		if (playerNames.length === 4) {
			document.getElementById('player3name').innerText = playerNames[2].length > 5 ? playerNames[2].slice(0, 5) + '.' : playerNames[2];
			document.getElementById('player4name').innerText = playerNames[3].length > 5 ? playerNames[3].slice(0, 5) + '.' : playerNames[3];
		}

		startGame(playerNames);
	});
}

function startGame(playerNames, isTournament = false) {
    canvas = document.getElementById('ponggame');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    game = new Game(isTournament, playerNames);

    document.fonts.load('10pt "Press Start 2P"')
        .then(() => {
            return document.fonts.ready;
        })
        .then(() => {
            game.start();
            setupDropdownListeners();

            document.getElementById("pongContainer").style.display = "flex";
            console.log("player names:", playerNames); // TODO: remove
        })
        .catch(error => {
            console.error("Error loading font:", error);
        });
}

function gameInit() {
    const usernameElement = document.querySelector('meta[name="username"]');
    const loggedInUsername = usernameElement ? usernameElement.getAttribute('content') : null;

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'test') {
        // TODO: testing only, remove after done
        startGame(['test1', 'tanas']); //* 1v1 test
        // startGame(['test1', 'tanas', 'qqq', 'www']); //* 2v2 test
        // startGame(['test1', 'tanas', 'qqq', 'www'], true); //* tournament test
        return;
    }

    const gameModes = [
        { mode: '1v1', loggedIn: true, players: 2 },
        { mode: '2v2', loggedIn: true, players: 4 },
        { mode: 'guest', loggedIn: false, players: 2 },
        { mode: 'tournament', loggedIn: true, players: 2 },
    ];

    // Find the game mode object based on the 'mode' parameter
    const selectedMode = gameModes.find(gameMode => gameMode.mode === mode);
    if (!selectedMode) {
        alert('Invalid mode selected');
        return;
    }

    // Check if the login status matches the selected mode's requirement
    const isLoggedIn = (loggedInUsername !== null);
    if (selectedMode.loggedIn && !isLoggedIn) {
        alert('You must be logged in to access this mode');
        return;
    }
    else if (!selectedMode.loggedIn && isLoggedIn) {
        alert('You are already logged in, you cannot play as guest');
        return;
    }

    if (selectedMode.mode === '1v1' || selectedMode.mode === '2v2')
        askForPlayerNames(selectedMode.players, true, loggedInUsername);
    else if (selectedMode.mode === 'guest')
        askForPlayerNames(selectedMode.players, false);
    else if (selectedMode.mode === 'tournament')
        console.log('Tournament mode selected');
}
