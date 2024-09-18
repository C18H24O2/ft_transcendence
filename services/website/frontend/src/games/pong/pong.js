import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors } from '@catppuccin/palette';
import earcut from 'earcut';

var canvas = document.getElementById('gameField');
/** @type {CanvasRenderingContext2D} */
var ctx = canvas.getContext('2d');

var scoreP1 = document.getElementById('score-player');
var scoreP2 = document.getElementById('score-opponent');

// some constants for the elements rendering
var middleX = canvas.width / 2;
var middleY = canvas.height / 2;
var paddleHeight = canvas.height / 5;
var paddleWidth = paddleHeight / 9;
var ballSize = canvas.height / 50;

//Going for an oop approach, not too sure of how it works in js yet

class Polygon {
	constructor(verticeList, holeIndice) {
		this.verticeList = verticeList;
		this.holeIndice = holeIndice;
		this.instructions = earcut(verticeList.flat(), holeIndice, 2)
		}
	get vertices() { return this.verticeList }
	render() {
		for (var i = 0; i < this.instructions.length; i += 3) {
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
		
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);
		this.verticeList = this.verticeList.map(([x, y]) => {
			var dx = x - pivotX;
			var dy = y - pivotY;

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
		var Xmove = this.x - newX;
		var Ymove = this.y - newY;
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
	var minX = Infinity, minY = Infinity;
	var maxX = -Infinity, maxY = -Infinity;

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
	var A_Left_B = bBoxA.maxX < bBoxB.minX;
	var A_Right_B = bBoxA.minX > bBoxB.maxX;
	var A_Above_B = bBoxA.maxY < bBoxB.minY;
	var A_Below_B = bBoxA.minY > bBoxB.maxY;
	return !(A_Left_B || A_Right_B || A_Above_B || A_Below_B);
}

function checkCollision(PolygonA, PolygonB)
{

	if (!boundingBoxCollide(boundingBox(PolygonA), boundingBox(PolygonB)))
		return false;
	var trianglesA =  PolygonA.triangles;
	var trianglesB = PolygonB.triangles;


	//WIP
}

//this makes it easier to scale more than 2 players if we do it

function renderField2d()
{
	var colors = flavors[getTheme().split('-').pop()].colors;
	ctx.fillStyle = colors.text.hex;
	ctx.strokeStyle = colors.text.hex;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	canvas.objects.forEach(object => {
		object.draw();
	})
	return (true);
}

var playerMove = [
	false,
	false,
	false,
	false
]

var lastRender = performance.now();

// info needed to update in remote multiplayer: y player 1; y player 2; ball(x, y); ball velocity (x, y)
// coordinates vary between 0, 2048
// speed varies between ~ -25 to +25
// serializing for performance ? caca

function gameLoop(timestamp)
{
	var deltaT = timestamp - lastRender;
	movePlayers(deltaT); //change for remote
	moveBall(deltaT); //keep for remote to keep somewhat smooth game
	checkGoal(); //change for remote to simply delete the ball when a goal is detected?
	renderField2d(); //keep for remote
	lastRender = timestamp;
	requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', init);

var ballDirection = 1;

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
}

function ballCollide()
{
	var ballBox = boundingBox(canvas.objects[2].shapes[0].vertices);
	var ball = canvas.objects[2];

	var playerPaddleBox;
	var playerPaddle;

	if (ballSpeedX < 0) {
		playerPaddleBox = boundingBox(canvas.objects[0].shapes[0].vertices);
		playerPaddle = canvas.objects[0];
	} else {
		playerPaddleBox = boundingBox(canvas.objects[1].shapes[0].vertices);
		playerPaddle = canvas.objects[1];
	}

	if (boundingBoxCollide(ballBox, playerPaddleBox))
	{
		var relBallY = ball.y - (playerPaddle.y - (paddleHeight / 2));

		var nrmlrelBallY = relBallY / paddleHeight;

		ballSpeedX = -ballSpeedX;

		var maxAngle = Math.PI / 1.5;
		var angle = nrmlrelBallY * maxAngle - (maxAngle / 2);
		var speed = Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2);
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

var score1 = 0;
var score2 = 0;

function checkGoal()
{
	var ball = canvas.objects[2];
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
		ballSpeedY = 0;
		ballSpeedX = 4;
		speedMult = 1;
		ball.setPos(middleX, middleY);
		canvas.objects[0].setPos(canvas.objects[0].x, middleY);
		canvas.objects[1].setPos(canvas.objects[1].x, middleY);
	}
}

var ballSpeedX = 4;
var ballSpeedY = 0;
var speedMult = 1;

function moveBall(deltaT)
{
	var ball = canvas.objects[2];

	console.log("speed X = " + String(speedMult * ballSpeedX));
	console.log("speed Y = " + String(speedMult * ballSpeedY));
	ball.move(speedMult * ballSpeedX * deltaT / 5, speedMult * ballSpeedY * deltaT / 5);
	ballCollide();
}

var PlayerSpeed = 20; //subject to change

//a simple movemement for now, it shouldn't be dependent on framerate, should be changed quite a bit for remote
function movePlayers(deltaT)
{
	var topLimit = paddleHeight / 2;
	var botLimit = canvas.height - paddleHeight / 2;

	if (playerMove[0] && canvas.objects[0].y < botLimit)
	{
		canvas.objects[0].move(0, PlayerSpeed * deltaT / 10);
		if (canvas.objects[0].y > botLimit)
		{
			canvas.objects[0].setPos(canvas.objects[0].x, botLimit);
		}
	}
	if (playerMove[1] && canvas.objects[0].y > topLimit)
	{
		canvas.objects[0].move(0, -PlayerSpeed * deltaT / 10);
		if (canvas.objects[0].y < topLimit)
		{
			canvas.objects[0].setPos(canvas.objects[0].x, topLimit);
		}
	}
	if (playerMove[2] && canvas.objects[1].y < botLimit)
	{
		canvas.objects[1].move(0, PlayerSpeed * deltaT / 10);
		if (canvas.objects[1].y > botLimit)
		{
			canvas.objects[1].setPos(canvas.objects[1].x, botLimit);
		}
	}
	if (playerMove[3] && canvas.objects[1].y > topLimit)
	{
		canvas.objects[1].move(0, -PlayerSpeed * deltaT / 10);
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
	}
}
