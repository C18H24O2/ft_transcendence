// @ts-check

import { getTheme } from '../../../theme.js'
import { initShaders } from './webgl-initshader.js';
import { mat4 } from 'gl-matrix';
import { ShapeMaker, GameObject } from './pong-classes.js';
import { getCatppuccinWEBGL } from './colorUtils.js';
import { MovementProvider } from './pongNewMovement.js';
import { initBuffers3d } from './webgl-initbuffers.js';

/**
 * @param {string} colorName
 * @param {WebGLRenderingContext} setgl
 */
function setClearColor(colorName, setgl)
{
	const bgColor = getCatppuccinWEBGL(colorName);
	setgl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1);
}

export class PongGame {

	/**
	 * @param {WebGLRenderingContext} gl 
	 * @param {HTMLElement | null} scoreP1
	 * @param {HTMLElement | null} scoreP2
	 * @param {HTMLElement | null} themeButton
	 */
	constructor(gl, scoreP1, scoreP2, programInfo, themeButton) {
		this.gl = gl;
		this.scoreP1 = scoreP1;
		this.scoreP2 = scoreP2;
		this.currentTheme = getTheme();
		this.newTheme = this.currentTheme;

		if (themeButton)
		{
			themeButton.addEventListener('click', this.changeTheme.bind(this));
		}

		this.gameObjects = {};
		
		this.view = true;
		
		gl.canvas.height = 1920;
		gl.canvas.width = 1920;
		gl.viewport(0,0,gl.canvas.width, gl.canvas.height);

		this.height = gl.canvas.height / 2;
		this.width = gl.canvas.width / 2;
		this.viewMatrix = mat4.create();
		this.projectionMatrix = mat4.create();
		this.projectionViewMatrix = mat4.create();

		this.base = this.height / 5;
		this.paddleHeight = this.base;
		this.paddleWidth = this.paddleHeight / 9;
		this.paddleDepth = this.paddleHeight;	
		this.ballSize = this.paddleHeight / 10;
		
		this.fieldOfView = (70 * Math.PI) / 180;
		this.aspect = this.width / this.height;
		this.zNear = 0.1;
		this.zFar = 7000.0;
		this.cameraDistance = (this.width / Math.tan(this.fieldOfView / 2)) + this.paddleDepth;

		this.speedMult = 1; //Multiplier for speed, increases
		this.BASE_BALL_SPEED = this.height / 160 * 2;
		this.MAX_BALL_SPEED_MULTIPLIER = 16; //how fast the ball can go
		this.BALL_SPEED_INCREASE = this.MAX_BALL_SPEED_MULTIPLIER / 200; //how fast it ramps up
		this.MAX_PADDLE_SPEED_MULTIPLIER = this.MAX_BALL_SPEED_MULTIPLIER / 20; // (1 + MAX_PADDLE_SPEED_MULTIPLIER) is the max paddle speed, calculated based on (speedMult / MAX_BALL_SPEED_MULTIPILIER) * MAX_PADDLE_SPEED
		this.BASE_PADDLE_SPEED = this.paddleHeight / 12;
		this.FRAMERATE = 1000 / 60;

		setClearColor("crust", this.gl);
		this.programInfo = programInfo;
		this.initShapes();

		this.then = Date.now();
		this.deltaTime = 0;
		this.renderInterval = -1;

		mat4.lookAt(this.viewMatrix, [0, 0, this.cameraDistance], [0, 0, 0], [0, 1, 0]);
		if (!this.view)
			mat4.perspective(this.projectionMatrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);
		else
			mat4.ortho(this.projectionMatrix, -this.width, this.width, -this.height, this.height, this.zNear, this.zFar);
		mat4.multiply(this.projectionViewMatrix, this.projectionMatrix, this.viewMatrix);

		this.render = this.render.bind(this);
	}

	static create(fieldId, score1, score2, themeButton)
	{
		const canvas = document.getElementById(fieldId);
		if (!(canvas instanceof HTMLCanvasElement)) {
			console.warn(`${fieldId} is not a valid canvas element`);
			return null;
		}
		let gl = canvas.getContext('webgl', {alpha: true});
		if (!(gl instanceof WebGLRenderingContext)) {
			console.warn(`Unable to fetch rendering context from ${fieldId}`);
			return null
		}
		let scoreP1 = document.getElementById(score1);
		let scoreP2 = document.getElementById(score2);
		let changeTheme = document.getElementById(themeButton);
		const programInfo = initShaders(gl);
		if (!programInfo)
			return null;
		return new PongGame(gl, scoreP1, scoreP2, programInfo, changeTheme);
	}

	cleanup()
	{
		this.stopMatch();
		removeEventListener('click', this.changeTheme);
	}

	/**
	 * 
	 * @param {String} player1 
	 * @param {String} player2 
	 * @param {Number} max_score 
	 * @param {[MovementProvider, MovementProvider]} movementProviders 
	 */
	startMatch(player1 = "player1", player2 = "player2", max_score = 0, movementProviders)
	{
		if (this.renderInterval != -1)
			return;
		if (typeof(player1) !== "string" || typeof(player2) !== "string" || typeof(max_score) != "number" || typeof(movementProviders) != "object")
			return;
		this.resetMatch(1, movementProviders);

		this.then = Date.now();
		this.deltaTime = 0;

		movementProviders.forEach(element => {
			element.initMovement();
		});
		this.renderInterval = setInterval(this.render, this.FRAMERATE, movementProviders, max_score);
	}

	stopMatch()
	{
		if (this.renderInterval != -1)
		{
			clearInterval(this.renderInterval);
			this.renderInterval = -1;
			return true;
		}
		return false;
	}

	initShapes()
	{
		const xTranslate = this.width - this.paddleWidth;

		let paddle1 = new GameObject(ShapeMaker.makeShape(this.gl, this.programInfo, mat4.create(), this.paddleHeight, this.paddleWidth, this.paddleDepth, "sapphire"));
		let paddle2 = new GameObject(ShapeMaker.makeShape(this.gl, this.programInfo, mat4.create(), this.paddleHeight, this.paddleWidth, this.paddleDepth, "sapphire"));
		let ball = new GameObject(ShapeMaker.makeShape(this.gl, this.programInfo, mat4.create(), this.ballSize, this.ballSize, this.ballSize, "sapphire"));

		this.gameObjects.paddle1 = paddle1;
		this.gameObjects.paddle2 = paddle2;
		this.gameObjects.ball = ball;
		
		//debug
		// let my_paddle = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "red"));
		// let my_ball = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), ballSize, ballSize, ballSize, "red"));
		// this.gameObjects.my_ball = my_ball;
		// this.gameObjects.my_paddle = my_paddle;
		// this.gameObjects.my_ball.setPos([0, 0, 0]);
		// this.gameObjects.my_paddle.setPos([xTranslate, 0, 0]);

		this.gameObjects.paddle1.setPos([-xTranslate, 0, 0]);
		this.gameObjects.paddle2.setPos([xTranslate, 0, 0]);
		this.gameObjects.ball.setPos([0, 0, 0]);


		this.gameObjects.ball.speedX = this.BASE_BALL_SPEED;
		this.gameObjects.ball.speedY = 0;

		this.gameObjects.paddle1.score = 0;
		this.gameObjects.paddle2.score = 0;
	}


	changeTheme()
	{
		this.newTheme = getTheme();
	}

	viewSwitch()
	{
		this.view = !this.view;

		mat4.identity(this.projectionMatrix);
		if (!this.view)
			mat4.perspective(this.projectionMatrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);
		else
			mat4.ortho(this.projectionMatrix, -this.width, this.width, -this.height, this.height, this.zNear, this.zFar);
		mat4.identity(this.projectionViewMatrix);
		mat4.multiply(this.projectionViewMatrix, this.projectionMatrix, this.viewMatrix);
	}
	
	render(movementProviders, max_score) {
		let now = Date.now();
		this.deltaTime = now - this.then;
		this.then = now;
		
		if (this.newTheme != this.currentTheme)
		{
			this.currentTheme = getTheme();
			setClearColor("crust", this.gl);
			this.gameObjects.paddle1.shape.updateColor();
			this.gameObjects.paddle2.shape.updateColor();
			this.gameObjects.ball.shape.updateColor();
		}
		this.movePlayers(movementProviders);
		movementProviders.forEach(element => {
			element.pollPlayer();
		});
		this.moveBall(this.deltaTime);
		this.checkGoal(max_score, movementProviders);
		this.drawScene();
	}

	/**
	 * 
	 * @param {WebGLRenderingContext} gl_to_clear 
	 */
	clearScene(gl_to_clear)
	{
		gl_to_clear.clearDepth(1.0);
		gl_to_clear.enable(gl_to_clear.DEPTH_TEST);
		gl_to_clear.depthFunc(gl_to_clear.LEQUAL);
		gl_to_clear.clear(gl_to_clear.COLOR_BUFFER_BIT | gl_to_clear.DEPTH_BUFFER_BIT);
	}

	drawScene()
	{	
		this.clearScene(this.gl);
		for (const element in this.gameObjects)
		{
			this.gameObjects[element].draw(this.projectionViewMatrix, this.viewMatrix);
		}
	}

	/**
	 * 
	 * @param {Number} side 
	 * @param {[MovementProvider, MovementProvider]} movementProviders
	 */
	reset(side = 0, movementProviders)
	{
		const xTranslate = this.width - this.paddleWidth;

		this.gameObjects.paddle1.setPos([-xTranslate, 0, 0]);
		this.gameObjects.paddle2.setPos([xTranslate, 0, 0]);
		this.gameObjects.ball.setPos([0, 0, 0]);

		this.gameObjects.ball.speedX = this.BASE_BALL_SPEED * Math.sign(side);
		this.gameObjects.ball.speedY = 0;
		this.speedMult = 1;
		
		movementProviders.forEach(element => {
			element.resetPlayer();
		});
	}

	resetScore()
	{
		this.gameObjects.paddle1.score = 0;
		this.gameObjects.paddle2.score = 0;

		if (this.scoreP2 != null)
			this.scoreP2.textContent = String(this.gameObjects.paddle2.score).padStart(3, '0');
		if (this.scoreP1 != null)
			this.scoreP1.textContent = String(this.gameObjects.paddle1.score).padStart(3, '0');
	}

	/**
	 * 
	 * @param {Number} side 
	 * @param {[MovementProvider, MovementProvider]} movementProviders
	 */
	resetMatch(side = 0, movementProviders)
	{
		this.resetScore();
		this.reset(side, movementProviders);
		this.stopMatch();
	}

	/**
	 * 
	 * @param {Number} max_score 
	 */
	checkGoal(max_score, movementProviders)
	{
		let ball = this.gameObjects.ball;	
		if (ball.x < -this.width || ball.x > this.width)
		{
			if (ball.x < -this.width)
			{
				this.gameObjects.paddle2.score += 1;
				if (this.scoreP2 != null)
					this.scoreP2.textContent = String(this.gameObjects.paddle2.score).padStart(3, '0');
				if (max_score != 0 && this.gameObjects.paddle2.score >= max_score)
					this.stopMatch();
				this.reset(-1, movementProviders);
			}
			if (ball.x > this.width)
			{
				this.gameObjects.paddle1.score += 1;
				if (this.scoreP1 != null)
					this.scoreP1.textContent = String(this.gameObjects.paddle1.score).padStart(3, '0');
				if (max_score != 0 && this.gameObjects.paddle1.score >= max_score)
					this.stopMatch();
				this.reset(1, movementProviders);
			}
		}
	}


	/**
	 * @typedef {Object} BoundingBox
	 * @property {Number} minX
	 * @property {Number} minY
	 * @property {Number} maxX
	 * @property {Number} maxY
	 * @property {(other: BoundingBox) => boolean} collides
	 */

	/**
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 * @returns {BoundingBox} 
	 */
	boundingBox(x, y, width, height)
	{
		let minX = x - width, maxX = x + width;
		let minY = y - height, maxY = y + height;

		return {
			minX, 
			minY, 
			maxX, 
			maxY,
			collides(other) {
				let A_Left_B = this.maxX < other.minX;
				let A_Right_B = this.minX > other.maxX;
				let A_Above_B = this.maxY < other.minY;
				let A_Below_B = this.minY > other.maxY;
				return !(A_Left_B || A_Right_B || A_Above_B || A_Below_B);
			}
		};
	}

	/**
	 * @param {Number} deltaTime
	 */
	moveBall(deltaTime) {
		let ball = this.gameObjects.ball;

		let movementX = this.speedMult * ball.speedX * (deltaTime / 10);
		let movementY = this.speedMult * ball.speedY * (deltaTime / 10);

		const steps = Math.ceil(Math.max(Math.abs(movementX), Math.abs(movementY)) / this.ballSize);
		const stepX = movementX / steps;
		const stepY = movementY / steps;

		for (let i = 0; i < steps; i++) {
			ball.move([stepX, stepY, 0]);
			if (this.ballCollide(ball)) {
				break;
			}
		}
	}

	/**
	 * @param {GameObject} ball
	 */
	ballCollide(ball, updateSpeed = true) {
		let paddle;

		// @ts-ignore
		if (ball.speedX < 0) {
			paddle = this.gameObjects.paddle1;
		} else {
			paddle = this.gameObjects.paddle2;
		}

		const limit = this.width - (2 * this.paddleWidth);
		const ballXSide = Math.abs(ball.x) + this.ballSize;
		const ballYSide = Math.abs(ball.y) + this.ballSize;

		if (ballXSide >= limit)
		{
			const ballBoundingBox = this.boundingBox(ball.x, ball.y, this.ballSize, this.ballSize);
			const paddleBoundingBox = this.boundingBox(paddle.x, paddle.y, this.paddleWidth, this.paddleHeight);

			if (ballBoundingBox.collides(paddleBoundingBox)) {
				ball.setPos([(limit - this.ballSize) * Math.sign(ball.x), ball.y, ball.z]);
				// @ts-ignore
				ball.speedX = -ball.speedX;

				let relBallY = ball.y - paddle.y;
				let nrmlrelBallY = relBallY / (this.paddleHeight + this.ballSize);

				const maxAngle = Math.PI*5 / 12;
				const angle = nrmlrelBallY * maxAngle;
				// @ts-ignore
				const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);

				// @ts-ignore
				ball.speedX = speed * Math.cos(angle) * Math.sign(ball.speedX);
				// @ts-ignore
				ball.speedY = speed * Math.sin(angle);

				if (this.speedMult < this.MAX_BALL_SPEED_MULTIPLIER && updateSpeed) 
					this.speedMult = Math.min(this.speedMult + this.BALL_SPEED_INCREASE, this.MAX_BALL_SPEED_MULTIPLIER);
				
				return (true); // Collision occurred
			}
		}
		if (ballYSide >= this.height) {
			ball.setPos([ball.x, (this.height - this.ballSize) * Math.sign(ball.y), ball.z]);
			// @ts-ignore
			ball.speedY = -ball.speedY;
			return (true);
		}

		return (false); // No collision with paddles
	}

	movePlayers(movementProviders)
	{
		const speed = (this.BASE_PADDLE_SPEED * (1 + ((this.speedMult / this.MAX_BALL_SPEED_MULTIPLIER) * this.MAX_PADDLE_SPEED_MULTIPLIER)) * (this.deltaTime / 10));
		const limit = this.height - this.paddleHeight;

		if (movementProviders[0].key_values[0] != movementProviders[0].key_values[1])
		{
			if (movementProviders[0].key_values[0] && this.gameObjects[movementProviders[0].paddle_name].y > -limit)
			{
				let paddle = this.gameObjects[movementProviders[0].paddle_name];
				paddle.move([0, -speed, 0]);
				if (paddle.y < -limit)
					paddle.setPos([paddle.x, -limit, paddle.z]);
			}
			if (movementProviders[0].key_values[1] && this.gameObjects[movementProviders[0].paddle_name].y < limit)
			{
				let paddle = this.gameObjects[movementProviders[0].paddle_name];
				paddle.move([0, speed, 0]);
				if (paddle.y > limit)
					paddle.setPos([paddle.x, limit, paddle.z]);
			}
		}
		if (movementProviders[1].key_values[0] != movementProviders[1].key_values[1])
		{
			if (movementProviders[1].key_values[0] && this.gameObjects[movementProviders[1].paddle_name].y > -limit)
			{
				let paddle = this.gameObjects[movementProviders[1].paddle_name];
				paddle.move([0, -speed, 0]);
				if (paddle.y < -limit)
					paddle.setPos([paddle.x, -limit, paddle.z]);
			}
			if (movementProviders[1].key_values[1] && this.gameObjects[movementProviders[1].paddle_name].y < limit)
			{
				let paddle = this.gameObjects[movementProviders[1].paddle_name];
				paddle.move([0, speed, 0]);
				if (paddle.y > limit)
					paddle.setPos([paddle.x, limit, paddle.z]);
			}
		}
	}
}