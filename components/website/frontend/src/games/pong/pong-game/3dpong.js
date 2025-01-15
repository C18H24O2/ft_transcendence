// @ts-check

import { getTheme } from '../../../theme.js'
import { initShaders } from './webgl-initshader.js';
import { mat4 } from 'gl-matrix';
import { ShapeMaker, GameObject } from './pong-classes.js';
import { getCatppuccinWEBGL } from './colorUtils.js';
import { MovementProvider } from './pongNewMovement.js';

/**
 * @param {string} colorName
 * @param {WebGLRenderingContext} setgl
 */
function setClearColor(colorName, setgl)
{
	const bgColor = getCatppuccinWEBGL(colorName);
	setgl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1);
}

/**
 * Getting the webgl context
 * @type {HTMLCanvasElement}
 */
// @ts-ignore
let canvas = document.getElementById("gameField");

/**
 * @type {WebGLRenderingContext}
 */
// @ts-ignore
let gl = canvas.getContext("webgl", {alpha: true});

// used to be able to keep track of theme changes
let currentTheme;
let newTheme;

// Global gameobjects container for ease of use
let gameObjects = {};

export { gameObjects };

// Basic info about the gamefield
function resizeCanvas(size)
{
	gl.canvas.width = size;
	gl.canvas.height = size;
	gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
}

export const height = gl.canvas.height / 2;
export const width = gl.canvas.width / 2;
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
const projectionViewMatrix = mat4.create();

// Score containers
let scoreP1 = document.getElementById("score-player");
let scoreP2 = document.getElementById("score-opponent");

// Game Objects Size
// Because I am dumb and do not know how to write code, these dimensions are half of the size of the actual object, 
export const base = height / 5;
export const paddleHeight = base;
export const paddleWidth = paddleHeight / 9;
export const paddleDepth = paddleHeight;	
export const ballSize = paddleHeight / 10;

// Camera values (mostly perspective camera, but some are reused)
// camera fov + distance to get similar results between orthographic camera and perspective camera
const fieldOfView = (70 * Math.PI) / 180;
const aspect = width / height;
const zNear = 0.1;
const zFar = 7000.0;
const cameraDistance = (width / Math.tan(fieldOfView / 2)) + paddleDepth;

// for the view switch between 3d and 2d
let view = true;
let initDone = false;
let matchEnded = false;

// Values for the game difficulty ramp up and reset
export let speedMult = 1; //Multiplier for speed, increases
export const BASE_BALL_SPEED = height / 160 * 2;
export const MAX_BALL_SPEED_MULTIPLIER = 16; //how fast the ball can go
export const BALL_SPEED_INCREASE = MAX_BALL_SPEED_MULTIPLIER / 200; //how fast it ramps up
export const MAX_PADDLE_SPEED_MULTIPLIER = MAX_BALL_SPEED_MULTIPLIER / 20; // (1 + MAX_PADDLE_SPEED_MULTIPLIER) is the max paddle speed, calculated based on (speedMult / MAX_BALL_SPEED_MULTIPILIER) * MAX_PADDLE_SPEED
export const BASE_PADDLE_SPEED = paddleHeight / 12;
export const FRAMERATE = 1000 / 60; //60 fps

// @ts-ignore
htmx.onLoad(_ => {
	initDone = false;
	matchEnded = false;
	
	// @ts-ignore
	canvas = document.getElementById("gameField");
	// @ts-ignore
	gl = canvas.getContext("webgl", {alpha: true});

	scoreP1 = document.getElementById("score-player");
	scoreP2 = document.getElementById("score-opponent");
});


// Some logging for debug purposes
function debug()
{
	console.log(`real position: ${gameObjects.ball.x}*${gameObjects.ball.y} | ai expected position: ${gameObjects.my_ball.x}*${gameObjects.my_ball.y}`)
	console.log(`real speed: ${gameObjects.ball.speedX}*${gameObjects.ball.speedY} | ai expected speed: ${gameObjects.my_ball.speedX}*${gameObjects.my_ball.speedY}`)
}


	//Function Setter, value initialisation and shader compilation
/**
 * 
 * @param {String} player1 
 * @param {String} player2 
 * @param {Number} max_score 
 * @param {Function} playerMoveFunc 
 * @param {[MovementProvider, MovementProvider]} movementProviders 
 */
export function startMatch(player1 = "player1", player2 = "player2", max_score = 0, playerMoveFunc, movementProviders)
{
	if (!gl)
	{
		console.warn('Your browser does not support webgl, consider using a different browser to access this functionnality');
		return;
	}
	if (typeof(player1) !== "string" || typeof(player2) !== "string" || typeof(max_score) != "number" || typeof(playerMoveFunc) != "function" || playerMoveFunc.length == 0 || typeof(movementProviders) != "object")
		return;
	if (initDone === false)
	{
		currentTheme = getTheme();
		newTheme = currentTheme;
		let changeTheme = document.getElementById('change-theme-button');
		if (changeTheme)
		{
			changeTheme.addEventListener('click', () => {
				newTheme = getTheme();
			});
		}
		
		if (gl.canvas.height < 1920 || gl.canvas.width < 1920 || gl.canvas.height != gl.canvas.width)
			resizeCanvas(1920);

		setClearColor("crust", gl);
		const programInfo = initShaders(gl);
		initShapes(programInfo);

		mat4.lookAt(viewMatrix, [0, 0, cameraDistance], [0, 0, 0], [0, 1, 0]);
		if (!view)
			mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
		else
			mat4.ortho(projectionMatrix, -width, width, -height, height, zNear, zFar);
		mat4.multiply(projectionViewMatrix, projectionMatrix, viewMatrix);
		initDone = true;
	}
	resetMatch(1, movementProviders);

	let then = Date.now();
	let deltaTime = 0;
	function render() {
		let now = Date.now();
		deltaTime = now - then;
		then = now;
		
		if (newTheme != currentTheme)
		{
			currentTheme = getTheme();
			setClearColor("crust", gl);
			gameObjects.paddle1.shape.updateColor();
			gameObjects.paddle2.shape.updateColor();
			gameObjects.ball.shape.updateColor();
		}
		playerMoveFunc(deltaTime, movementProviders);
		movementProviders.forEach(element => {
			element.pollPlayer();
		});
		moveBall(deltaTime);
		checkGoal(max_score, movementProviders);
		drawScene();
		//debug();
		if (matchEnded)
			clearInterval(intervalId);
	}
	movementProviders.forEach(element => {
		element.initMovement();
	});
	let intervalId = setInterval(render, FRAMERATE);
}

	//set the paddles and the balls on the field
/**
 * @param {import("./webgl-initshader.js").ProgramInfo | null} programInfo
 */
function initShapes(programInfo)
{
	const xTranslate = width - paddleWidth;

	let paddle1 = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "sapphire"));
	let paddle2 = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "sapphire"));
	let ball = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), ballSize, ballSize, ballSize, "sapphire"));

	gameObjects.paddle1 = paddle1;
	gameObjects.paddle2 = paddle2;
	gameObjects.ball = ball;
	
	//debug
	// let my_paddle = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "red"));
	// let my_ball = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), ballSize, ballSize, ballSize, "red"));
	// gameObjects.my_ball = my_ball;
	// gameObjects.my_paddle = my_paddle;
	// gameObjects.my_ball.setPos([0, 0, 0]);
	// gameObjects.my_paddle.setPos([xTranslate, 0, 0]);

	gameObjects.paddle1.setPos([-xTranslate, 0, 0]);
	gameObjects.paddle2.setPos([xTranslate, 0, 0]);
	gameObjects.ball.setPos([0, 0, 0]);


	gameObjects.ball.speedX = BASE_BALL_SPEED;
	gameObjects.ball.speedY = 0;

	gameObjects.paddle1.score = 0;
	gameObjects.paddle2.score = 0;
}

	//swap Between 2d and 3d
export function viewSwitch()
{
	view = !view;

	mat4.identity(projectionMatrix);
	if (!view)
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
	else
		mat4.ortho(projectionMatrix, -width, width, -height, height, zNear, zFar);
	mat4.identity(projectionViewMatrix);
	mat4.multiply(projectionViewMatrix, projectionMatrix, viewMatrix);
}
// @ts-ignore
window.viewSwitch = viewSwitch;


//clear the gameField
/**
 * 
 * @param {WebGLRenderingContext} gl_to_clear 
 */
function clearScene(gl_to_clear)
{
	gl_to_clear.clearDepth(1.0);
	gl_to_clear.enable(gl_to_clear.DEPTH_TEST);
	gl_to_clear.depthFunc(gl_to_clear.LEQUAL);
	gl_to_clear.clear(gl_to_clear.COLOR_BUFFER_BIT | gl_to_clear.DEPTH_BUFFER_BIT);
}

	//clears the scene a calls a draw function on every
function drawScene()
{	
	clearScene(gl);
	for (const element in gameObjects)
	{
		gameObjects[element].draw(projectionViewMatrix, viewMatrix);
	}
}

//code for player and ball movement under here

/**
 * 
 * @param {Number} side 
 * @param {[MovementProvider, MovementProvider]} movementProviders
 */
function reset(side = 0, movementProviders)
{
	const xTranslate = width - paddleWidth;

	gameObjects.paddle1.setPos([-xTranslate, 0, 0]);
	gameObjects.paddle2.setPos([xTranslate, 0, 0]);
	gameObjects.ball.setPos([0, 0, 0]);

	gameObjects.ball.speedX = BASE_BALL_SPEED * Math.sign(side);
	gameObjects.ball.speedY = 0;
	speedMult = 1;
	
	movementProviders.forEach(element => {
		element.resetPlayer();
	});
}

/**
 * 
 * @param {Number} side 
 * @param {[MovementProvider, MovementProvider]} movementProviders
 */
function resetMatch(side = 0, movementProviders)
{
	gameObjects.paddle1.score = 0;
	gameObjects.paddle2.score = 0;

	if (scoreP2 != null)
		scoreP2.textContent = String(gameObjects.paddle2.score).padStart(3, '0');
	if (scoreP1 != null)
		scoreP1.textContent = String(gameObjects.paddle1.score).padStart(3, '0');
	reset(side, movementProviders);
	matchEnded = false;
}

/**
 * 
 * @param {Number} max_score 
 */
function checkGoal(max_score, movementProviders)
{
	let ball = gameObjects.ball;	
	if (ball.x < -width || ball.x > width)
	{
		if (ball.x < -width)
		{
			gameObjects.paddle2.score += 1;
			if (scoreP2 != null)
				scoreP2.textContent = String(gameObjects.paddle2.score).padStart(3, '0');
			if (max_score != 0 && gameObjects.paddle2.score >= max_score)
				matchEnded = true;
			reset(-1, movementProviders);
		}
		if (ball.x > width)
		{
			gameObjects.paddle1.score += 1;
			if (scoreP1 != null)
				scoreP1.textContent = String(gameObjects.paddle1.score).padStart(3, '0');
			if (max_score != 0 && gameObjects.paddle1.score >= max_score)
				matchEnded = true;
			reset(1, movementProviders);
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
function boundingBox(x, y, width, height)
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
 * 
 */
function moveBall(deltaTime) {
	let ball = gameObjects.ball;

	let movementX = speedMult * ball.speedX * (deltaTime / 10);
	let movementY = speedMult * ball.speedY * (deltaTime / 10);

	const steps = Math.ceil(Math.max(Math.abs(movementX), Math.abs(movementY)) / ballSize);
	const stepX = movementX / steps;
	const stepY = movementY / steps;

	for (let i = 0; i < steps; i++) {
		ball.move([stepX, stepY, 0]);
		if (ballCollide(ball)) {
			break;
		}
	}
}

/**
 * @param {GameObject} ball
 */
export function ballCollide(ball, updateSpeed = true) {
	let paddle;

	if (ball.speedX < 0) {
		paddle = gameObjects.paddle1;
	} else {
		paddle = gameObjects.paddle2;
	}

	const limit = width - (2 * paddleWidth);
	const ballXSide = Math.abs(ball.x) + ballSize;
	const ballYSide = Math.abs(ball.y) + ballSize;

	if (ballXSide >= limit)
	{
		const ballBoundingBox = boundingBox(ball.x, ball.y, ballSize, ballSize);
		const paddleBoundingBox = boundingBox(paddle.x, paddle.y, paddleWidth, paddleHeight);

		if (ballBoundingBox.collides(paddleBoundingBox)) {
			ball.setPos([(limit - ballSize) * Math.sign(ball.x), ball.y, ball.z]);
			ball.speedX = -ball.speedX;

			let relBallY = ball.y - paddle.y;
			let nrmlrelBallY = relBallY / (paddleHeight + ballSize);

			const maxAngle = Math.PI*5 / 12;
			const angle = nrmlrelBallY * maxAngle;
			const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);

			ball.speedX = speed * Math.cos(angle) * Math.sign(ball.speedX);
			ball.speedY = speed * Math.sin(angle);

			if (speedMult < MAX_BALL_SPEED_MULTIPLIER && updateSpeed) 
				speedMult = Math.min(speedMult + BALL_SPEED_INCREASE, MAX_BALL_SPEED_MULTIPLIER);
			
			return (true); // Collision occurred
		}
	}
	if (ballYSide >= height) {
		ball.setPos([ball.x, (height - ballSize) * Math.sign(ball.y), ball.z]);
		ball.speedY = -ball.speedY;
		return (true);
	}

	return (false); // No collision with paddles
}
