import { getTheme } from '../../../theme.js'
import { initShaders } from './webgl-initshader.js';
import { Shape3d } from './webgl-shape.js';
import { mat4 } from 'gl-matrix';
import { ShapeMaker, GameObject } from './pong-classes.js';
import { getCatppuccinWEBGL } from './colorUtils.js';

function setClearColor(colorName, setgl)
{
	const bgColor = getCatppuccinWEBGL(colorName);
	setgl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1);
}

	//Getting the webgl context
/**@type {HTMLCanvasElement} */
let canvas = document.getElementById("gameField");

/**@type {WebGLRenderingContext} */
let gl = canvas.getContext("webgl", {alpha: true});

	//used to be able to keep track of theme changes
let currentTheme;
let newTheme;

	//global gameobjects container for ease of use
let gameObjects = {};

export { gameObjects };

	//Basic info about the gamefield

function resizeCanvas(size)
{
	gl.canvas.width = size;
	gl.canvas.height = size;
	gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
}

const height = gl.canvas.height / 2;
const width = gl.canvas.width / 2;
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
const projectionViewMatrix = mat4.create();

	//Score containers
let scoreP1 = document.getElementById("score-player");
let scoreP2 = document.getElementById("score-opponent");

	//Game Objects Size
//Because I am dumb and do not know how to write code, these dimensions are half of the size of the actual object, 
const base = height / 5;
const paddleHeight = base;
const paddleWidth = paddleHeight / 9;
const paddleDepth = paddleHeight;	
const ballSize = paddleHeight / 10;

	//Camera values (mostly perspective camera, but some are reused)
//camera fov + distance to get similar results between orthographic camera and perspective camera
const fieldOfView = (70 * Math.PI) / 180;
const aspect = width / height;
const zNear = 0.1;
const zFar = 7000.0;
const cameraDistance = (width / Math.tan(fieldOfView / 2)) + paddleDepth;

	//for the view switch between 3d and 2d
let view = true;
let initDone = false;
let matchEnded = false;

	//Values for the game difficulty ramp up and reset
let speedMult = 1; //Multiplier for speed, increases
const BASE_BALL_SPEED = height / 160;
const MAX_BALL_SPEED_MULTIPLIER = 20; //how fast the ball can go
const BALL_SPEED_INCREASE = MAX_BALL_SPEED_MULTIPLIER / 200; //how fast it ramps up
const MAX_PADDLE_SPEED_MULTIPLIER = MAX_BALL_SPEED_MULTIPLIER / 20; // (1 + MAX_PADDLE_SPEED_MULTIPLIER) is the max paddle speed, calculated based on (speedMult / MAX_BALL_SPEED_MULTIPILIER) * MAX_PADDLE_SPEED
const BASE_PADDLE_SPEED = paddleHeight / 12;

htmx.onLoad(e => {
	initDone = false;
	matchEnded = false;
	canvas = document.getElementById("gameField");
	scoreP1 = document.getElementById("score-player");
	scoreP2 = document.getElementById("score-opponent");
	gl = canvas.getContext("webgl", {alpha: true});
});

	//Function Setter, value initialisation and shader compilation
export function startMatch(player1 = "player1", player2 = "player2", max_score = 0, keyDownFunc, keyUpFunc)
{
	if (typeof(player1) !== "string" || typeof(player2) !== "string" || typeof(max_score) != "number" || typeof(keyDownFunc) !== "function" || typeof(keyUpFunc)  !== "function")
		return;
	if (initDone === false)
	{
		document.addEventListener('keydown', keyDownFunc);
		document.addEventListener('keyup', keyUpFunc);

		currentTheme = getTheme();
		newTheme = currentTheme;
		let changeTheme = document.getElementById('change-theme-button');
		if (changeTheme)
		{
			changeTheme.addEventListener('click', () => {
				newTheme = getTheme();
			})
		}
		if (!gl)
		{
			console.warn('Your browser does not support webgl, consider using a different browser to access this functionnality');
			return;
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
	resetMatch(1, player1, player2);

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
		movePlayers(deltaTime);
		moveBall(deltaTime);
		checkGoal(max_score);
		drawScene();
		if (matchEnded)
			clearInterval(intervalId);
	}
	let intervalId = setInterval(render, (1000 / 60));
}

	//set the paddles and the balls on the field
function initShapes(programInfo)
{
	const xTranslate = width - paddleWidth;

	let paddle1 = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "sapphire"));
	let paddle2 = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "sapphire"));
	let ball = new GameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), ballSize, ballSize, ballSize, "sapphire"));

	gameObjects.paddle1 = paddle1;
	gameObjects.paddle2 = paddle2;
	gameObjects.ball = ball;

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
window.viewSwitch = viewSwitch;


//clear the gameField
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

	gameObjects.paddle1.draw(projectionViewMatrix, viewMatrix);
	gameObjects.paddle2.draw(projectionViewMatrix, viewMatrix);
	gameObjects.ball.draw(projectionViewMatrix, viewMatrix);
}

//code for player and ball movement under here

function reset(side = 0)
{
	const xTranslate = width - paddleWidth;

	gameObjects.paddle1.setPos([-xTranslate, 0, 0]);
	gameObjects.paddle2.setPos([xTranslate, 0, 0]);
	gameObjects.ball.setPos([0, 0, 0]);

	gameObjects.ball.speedX = BASE_BALL_SPEED * Math.sign(side);
	gameObjects.ball.speedY = 0;
	speedMult = 1;
}

function resetMatch(side = 0)
{
	gameObjects.paddle1.score = 0;
	gameObjects.paddle2.score = 0;

	scoreP2.textContent = String(gameObjects.paddle2.score).padStart(3, '0');
	scoreP1.textContent = String(gameObjects.paddle1.score).padStart(3, '0');
	reset(side);
	matchEnded = false;
}

function checkGoal(max_score)
{
	let ball = gameObjects.ball;	
	if (ball.x < -width || ball.x > width)
	{
		if (ball.x < -width)
		{
			gameObjects.paddle2.score += 1;
			scoreP2.textContent = String(gameObjects.paddle2.score).padStart(3, '0');
			if (max_score != 0 && gameObjects.paddle2.score >= max_score)
				matchEnded = true;
			reset(-1);
		}
		if (ball.x > width)
		{
			gameObjects.paddle1.score += 1;
			scoreP1.textContent = String(gameObjects.paddle1.score).padStart(3, '0');
			if (max_score != 0 && gameObjects.paddle1.score >= max_score)
				matchEnded = true;
			reset(1);
		}
	}
}

function BoundingBox(x, y, width, height)
{
	let minX = x - width, maxX = x + width;
	let minY = y - height, maxY = y + height;

	return {minX, minY, maxX, maxY};
}

function boundingBoxCollide(bBoxA, bBoxB)
{
	let A_Left_B = bBoxA.maxX < bBoxB.minX;
	let A_Right_B = bBoxA.minX > bBoxB.maxX;
	let A_Above_B = bBoxA.maxY < bBoxB.minY;
	let A_Below_B = bBoxA.minY > bBoxB.maxY;
	return !(A_Left_B || A_Right_B || A_Above_B || A_Below_B);
}

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

function ballCollide(ball) {
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
		const ballBoundingBox = BoundingBox(ball.x, ball.y, ballSize, ballSize);
		const paddleBoundingBox = BoundingBox(paddle.x, paddle.y, paddleWidth, paddleHeight);

		if (boundingBoxCollide(ballBoundingBox, paddleBoundingBox)) {
			ball.setPos([(limit - ballSize) * Math.sign(ball.x), ball.y, ball.z]);
			ball.speedX = -ball.speedX;

			let relBallY = ball.y - paddle.y;
			let nrmlrelBallY = relBallY / (paddleHeight + ballSize);

			const maxAngle = Math.PI*5 / 12;
			const angle = nrmlrelBallY * maxAngle;
			const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);

			ball.speedX = speed * Math.cos(angle) * Math.sign(ball.speedX);
			ball.speedY = speed * Math.sin(angle);

			if (speedMult < MAX_BALL_SPEED_MULTIPLIER) 
				speedMult = Math.min(speedMult + BALL_SPEED_INCREASE, MAX_BALL_SPEED_MULTIPLIER);
			
			return true; // Collision occurred
		}
	}
	if (ballYSide >= height) {
		ball.setPos([ball.x, (height - ballSize) * Math.sign(ball.y), ball.z]);
		ball.speedY = -ball.speedY;
		return (true)
	}

	return false; // No collision with paddles
}

function movePlayers(deltaTime)
{
	const speed = (BASE_PADDLE_SPEED * (1 + ((speedMult / MAX_BALL_SPEED_MULTIPLIER) * MAX_PADDLE_SPEED_MULTIPLIER)) * (deltaTime / 10));
	const limit = height - paddleHeight;

	if (keyPress[0] ^ keyPress[1])
	{
		if (keyPress[0] && gameObjects.paddle1.y > -limit)
		{
			let paddle = gameObjects.paddle1;
			paddle.move([0, -speed, 0]);
			if (paddle.y < -limit)
				paddle.setPos([paddle.x, -limit, paddle.z]);
		}
		if (keyPress[1] && gameObjects.paddle1.y < limit)
		{
			let paddle = gameObjects.paddle1;
			paddle.move([0, speed, 0]);
			if (paddle.y > limit)
				paddle.setPos([paddle.x, limit, paddle.z]);
		}
	}
	if (keyPress[2] ^ keyPress[3])
	{
		if (keyPress[2] && gameObjects.paddle2.y >= -limit)
		{
			let paddle = gameObjects.paddle2;
			paddle.move([0, -speed, 0]);
			if (paddle.y < -limit)
				paddle.setPos([paddle.x, -limit, paddle.z]);
		}
		if (keyPress[3] && gameObjects.paddle2.y < limit)
		{
			let paddle = gameObjects.paddle2;
			paddle.move([0, speed, 0]);
			if (paddle.y > limit)
				paddle.setPos([paddle.x, limit, paddle.z]);
		}
	}
}

let keyPress = [
	false,	//player 1 down
	false,	//player 1 up
	false,	//player 2 down
	false,	//player 2 up
];

export function pongSetPlayerMove(index, value)
{
	if (typeof(index) !== "number" || typeof(value) !== "boolean")
		return;
	keyPress[index] = value;
}
