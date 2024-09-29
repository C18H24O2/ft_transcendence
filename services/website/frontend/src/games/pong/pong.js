import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors } from '@catppuccin/palette';
import earcut from 'earcut';

let canvas = document.getElementById('gameField');
/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext('2d');

let scoreP1 = document.getElementById('score-player');
let scoreP2 = document.getElementById('score-opponent');

// some constants for the elements rendering
let middleX = canvas.width / 2;
let middleY = canvas.height / 2;
let paddleHeight = canvas.height / 5;
let paddleWidth = paddleHeight / 9;
let ballSize = canvas.height / 50;

//Going for an oop approach, not too sure of how it works in js yet

class Polygon {
	constructor(verticeList, holeIndice) {
		this.verticeList = verticeList;
		this.holeIndice = holeIndice;
		this.instructions = earcut(verticeList.flat(), holeIndice, 2)
		}
	get vertices() { return this.verticeList }
	render() {
		for (let i = 0; i < this.instructions.length; i += 3) {
			ctx.beginPath();
			ctx.moveTo(this.verticeList[this.instructions[i]][0], this.verticeList[this.instructions[i]][1]);
			ctx.lineTo(this.verticeList[this.instructions[i + 1]][0], this.verticeList[this.instructions[i + 1]][1]);
			ctx.lineTo(this.verticeList[this.instructions[i + 2]][0], this.verticeList[this.instructions[i + 2]][1]);
			ctx.closePath();
			ctx.stroke();
			ctx.fill('evenodd');
		}
	};
	//Xmove an Ymove correspond to the amount in each direction to move
	//eg: [-1, +2] moves all the vertices 1 left and 2 down
	moveVertices(Xmove, Ymove){
		this.verticeList = this.verticeList.map(([x, y]) => {
			return ([x + Xmove, y + Ymove]);
		});
	}

	//rotates all the vertices from a given pivot point. takes value in degrees
	rotateVertices(angle, pivotX, pivotY) {
		angle = angle * (Math.PI / 180);
		
		let cos = Math.cos(angle);
		let sin = Math.sin(angle);
		this.verticeList = this.verticeList.map(([x, y]) => {
			let dx = x - pivotX;
			let dy = y - pivotY;

			return ([pivotX + (dx * cos - dy * sin), pivotY + (dx * sin + dy * cos)]);
		})
	}
}

//some default shapes to make my life easier (maybe)

class ShapeMaker {
	static makeRectangle(x, y, width, height) {
		return new Polygon([[x, y],[x + width, y],[x + width, y + height],[x, y + height]]);
	}
	
	static makeRectangle_mid(x, y ,width, height) {

		return new Polygon([[x - width / 2, y - height / 2],[x + width / 2, y - height / 2],[x + width / 2, y + height / 2],[x - width / 2, y + height / 2]]);
	}
	static makePolygon(x, y, radius, vertNum) {

	}
	static makeShape(verticeList) {
		return new Polygon(verticeList);
	}
}

class GameObject {
	constructor(x, y, shapeList) {
		this.x = x || 0;
		this.y = y || 0;
		this.shapes = shapeList || [];
	}

	//renders all shapes in the object
	draw() {
		this.shapes.forEach(shape => {
			shape.render();
		});
	}
	//moves all the shapes in the object by Xmove & Ymove, eg: move(-50, +25) moves the object 50 to the left and 25 down
	move(Xmove, Ymove) {
		this.shapes.forEach( shape => {
			shape.moveVertices(Xmove, Ymove);
		})
		this.x += Xmove;
		this.y += Ymove;
	}
	//rotates all the shapes in the object, takes value in degrees
	rotate(angle) {
		this.shapes.forEach( shape => {
			shape.rotateVertices(angle, this.x, this.y);
		})
	}

	setPos(newX, newY)
	{
		let Xmove = this.x - newX;
		let Ymove = this.y - newY;
		this.move(-Xmove, -Ymove);
	}
}

class Ball extends GameObject {
	constructor(x, y, shapeList) {
		super(x, y, shapeList);
	}
}

class Player extends GameObject {

	constructor(x, y, shapeList) {
		super(x, y, shapeList);
	}
}

//start for what should be an SAT collision detection system

function boundingBox(vertList)
{
	let minX = Infinity, minY = Infinity;
	let maxX = -Infinity, maxY = -Infinity;

	vertList.forEach(([x, y]) => {
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	});
	return { minX, minY, maxX, maxY };
}

function boundingBoxCollide(bBoxA, bBoxB)
{
	let A_Left_B = bBoxA.maxX < bBoxB.minX;
	let A_Right_B = bBoxA.minX > bBoxB.maxX;
	let A_Above_B = bBoxA.maxY < bBoxB.minY;
	let A_Below_B = bBoxA.minY > bBoxB.maxY;
	return !(A_Left_B || A_Right_B || A_Above_B || A_Below_B);
}

//this makes it easier to scale more than 2 players if we do it

function renderField2d()
{
	let colors = flavors[getTheme().split('-').pop()].colors;
	ctx.fillStyle = colors.mantle.hex;
	ctx.strokeStyle = colors.mantle.hex;
	
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = colors.text.hex;
	ctx.strokeStyle = colors.text.hex;
	canvas.objects.forEach(object => {
		object.draw();
	})
	return (true);
}

let playerMove = [
	false,
	false,
	false,
	false
]

let lastRender = performance.now();

// info needed to update in remote multiplayer: y player 1; y player 2; ball(x, y); ball velocity (x, y)
// coordinates vary between 0, 2048
// speed varies between ~ -25 to +25
// serializing for performance ? caca

//will have to find how to syncronise, but its a start
function serverUpdate(p1y, p2y, ballX, ballY, speedX, speedY)
{
	let player1 = canvas.objects[0];
	let player2 = canvas.objects[1];
	let ball = canvas.objects[2];

	player1.setPos(player1.x, p1y);
	player2.setPos(player2.x, p2y);
	ball.setPos(ballX, ballY);
	ballSpeedX = speedX;
	ballSpeedY = speedY;
}

function gameLoop(timestamp)
{
	let deltaT = timestamp - lastRender;
	if (pauseVal)
	{
		movePlayers(deltaT); //change for remote
		moveBall(deltaT); //keep for remote to keep somewhat smooth game
		checkGoal(); //change for remote to simply delete the ball when a goal is detected?
		renderField2d(); //keep for remote
	}
	else
	{
		renderField2d();
		renderPauseMenu();
	}
	lastRender = timestamp;
	requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', init);

function init(){
	const objects = [
		new Player(paddleWidth / 2, middleY, [ShapeMaker.makeRectangle_mid(paddleWidth / 2, middleY, paddleWidth, paddleHeight)]),
		new Player(canvas.width - paddleWidth / 2, middleY, [ShapeMaker.makeRectangle_mid(canvas.width - paddleWidth / 2, middleY, paddleWidth, paddleHeight)]),
		new Ball(middleX, middleY, [ShapeMaker.makeRectangle_mid(middleX, middleY, ballSize, ballSize)])
	]
	canvas.objects = objects;
	document.addEventListener('keydown', keyDown, false);
	document.addEventListener('keyup', keyUp, false);
	requestAnimationFrame(gameLoop)

	window.onblur = pause;
}

let pauseVal = true;

function renderPauseMenu()
{
	let colors = flavors[getTheme().split('-').pop()].colors;
	ctx.fillStyle = colors.mantle.hex;
	ctx.strokeStyle = colors.mantle.hex;

	ctx.globalAlpha = 0.81;
	ctx.beginPath();
	//ctx.roundRect(middleX - (canvas.width / 4), middleY - (canvas.height / 6), canvas.width / 2, canvas.height / 3, canvas.width / 50);
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.stroke();
	ctx.fill();
	ctx.globalAlpha = 1;
	ctx.font = "70px Serif";
	ctx.fillStyle = colors.text.hex;
	ctx.strokeStyle = colors.text.hex;
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	ctx.fillText("The game is paused.", middleX, middleY, (canvas.width / 2));
	ctx.textBaseline = "top";
	ctx.fillText("Press Space to resume", middleX, middleY, (canvas.width / 2));
}

function pause()
{
	pauseVal = false;
	renderPauseMenu();
}

function ballCollide()
{
	let ballBox = boundingBox(canvas.objects[2].shapes[0].vertices);
	let ball = canvas.objects[2];

	let playerPaddleBox;
	let playerPaddle;

	if (ballSpeedX < 0) {
		playerPaddleBox = boundingBox(canvas.objects[0].shapes[0].vertices);
		playerPaddle = canvas.objects[0];
	} else {
		playerPaddleBox = boundingBox(canvas.objects[1].shapes[0].vertices);
		playerPaddle = canvas.objects[1];
	}

	if (boundingBoxCollide(ballBox, playerPaddleBox))
	{
		if (ball.x <= middleX)
		{
			ball.setPos(paddleWidth + ballSize / 2, ball.y);
		}
		else
		{
			ball.setPos(canvas.width - (paddleWidth + ballSize / 2), ball.y);
		}
		let relBallY = ball.y - (playerPaddle.y - (paddleHeight / 2));

		let nrmlrelBallY = relBallY / paddleHeight;

		ballSpeedX = -ballSpeedX;

		let maxAngle = Math.PI / 1.5;
		let angle = nrmlrelBallY * maxAngle - (maxAngle / 2);
		let speed = Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2);
		ballSpeedX = speed * Math.cos(angle) * Math.sign(ballSpeedX);
		ballSpeedY = speed * Math.sin(angle);
		if (speedMult < 5)
		{
			speedMult += 0.1;
		}
	}
	if (ball.y - ballSize / 2 <= 0 || ball.y + ballSize / 2 >= canvas.height)
	{
		ballSpeedY *= -1;
	}
	return (false);
}

let score1 = 0;
let score2 = 0;

function checkGoal()
{
	let ball = canvas.objects[2];
	if (ball.x < 0 || ball.x > canvas.width)
	{
		if (ball.x < 0)
		{
			score2 += 1;
			scoreP2.textContent = String(score2).padStart(3, '0');
			
		}
		if (ball.x > canvas.width)
		{
			score1 += 1;
			scoreP1.textContent = String(score1).padStart(3, '0');
		}
		ballSpeedX = 4;
		ballSpeedY = 0;
		speedMult = 1;
		ball.setPos(middleX, middleY);
		canvas.objects[0].setPos(canvas.objects[0].x, middleY);
		canvas.objects[1].setPos(canvas.objects[1].x, middleY);
	}
}

let ballSpeedX = 4;
let ballSpeedY = 0;
let speedMult = 1;

function moveBall(deltaT)
{
	let ball = canvas.objects[2];
	ball.move(speedMult * ballSpeedX * deltaT / 5, speedMult * ballSpeedY * deltaT / 5);
	ballCollide();
}

let PlayerSpeed = 22; //subject to change

//a simple movemement for now, it shouldn't be dependent on framerate, should be changed quite a bit for remote
function movePlayers(deltaT)
{
	let topLimit = paddleHeight / 2;
	let botLimit = canvas.height - paddleHeight / 2;
	let pSpeed = PlayerSpeed * (deltaT / 10);

	if (playerMove[0] && canvas.objects[0].y < botLimit)
	{
		canvas.objects[0].move(0, pSpeed);
		if (canvas.objects[0].y > botLimit)
		{
			canvas.objects[0].setPos(canvas.objects[0].x, botLimit);
		}
	}
	if (playerMove[1] && canvas.objects[0].y > topLimit)
	{
		canvas.objects[0].move(0, -pSpeed);
		if (canvas.objects[0].y < topLimit)
		{
			canvas.objects[0].setPos(canvas.objects[0].x, topLimit);
		}
	}
	if (playerMove[2] && canvas.objects[1].y < botLimit)
	{
		canvas.objects[1].move(0, pSpeed);
		if (canvas.objects[1].y > botLimit)
		{
			canvas.objects[1].setPos(canvas.objects[1].x, botLimit);
		}
	}
	if (playerMove[3] && canvas.objects[1].y > topLimit)
	{
		canvas.objects[1].move(0, -pSpeed);
		if (canvas.objects[1].y < topLimit)
		{
			canvas.objects[1].setPos(canvas.objects[1].x, topLimit);
		}
	}
}

function keyUp(event)
{
	switch (event.keyCode)
	{
		case 83:
			playerMove[0] = false;
			break;
		case 87:
			playerMove[1] = false;
			break;
		case 40:
			playerMove[2] = false;
			break;
		case 38:
			playerMove[3] = false;
			break;
	}
}

function keyDown(event)
{
	switch (event.keyCode)
	{
		case 83:
			playerMove[0] = true;
			break;
		case 87:
			playerMove[1] = true;
			break;
		case 40:
			playerMove[2] = true;
			break;
		case 38:
			playerMove[3] = true;
			break;
		case 32:
			if (pauseVal)
				renderPauseMenu();
			pauseVal = !pauseVal;
			return ;
	}
}
