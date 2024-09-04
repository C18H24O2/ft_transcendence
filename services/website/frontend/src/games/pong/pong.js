import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors } from '@catppuccin/palette';
import earcut from 'earcut';

var canvas = document.getElementById('gameField')
/** @type {CanvasRenderingContext2D} */
var ctx = canvas.getContext('2d');

// some constants for the elements rendering
var middleX = canvas.width / 2;
var middleY = canvas.height / 2;
var paddleHeight = canvas.height / 5;
var paddleWidth = paddleHeight / 9;
var ballSize = canvas.height / 50;

//Going for an oop approach, not too sure of how it works in js yet 

function removeDuplicatePoints(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function generateTriangles(instructions, verticeList)
{
	var triangleList = [];
	
	for (var i = 0; i < instructions.length; i++)
	{
		triangleList[i] = verticeList[instructions[i]];
	}
	return (triangleList);
}

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
	var A_Right_B = bBoxA.minX > bBox.maxX;
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

function gameLoop(timestamp)
{
	var deltaT = timestamp - lastRender;
	movePlayers(deltaT);
	renderField2d();
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
}

var PlayerSpeed = 15; //subject to change

//a simple movemement for now, it shouldn't be dependent on framerate
function movePlayers(deltaT)
{
	if (playerMove[0] && canvas.objects[0].y < canvas.height - paddleHeight / 2)
		canvas.objects[0].move(0, PlayerSpeed * deltaT / 10);
	if (playerMove[1] && canvas.objects[0].y > paddleHeight / 2)
		canvas.objects[0].move(0, -PlayerSpeed * deltaT / 10);
	if (playerMove[2] && canvas.objects[1].y < canvas.height - paddleHeight / 2)
		canvas.objects[1].move(0, PlayerSpeed * deltaT / 10);
	if (playerMove[3] && canvas.objects[1].y > paddleHeight / 2)
		canvas.objects[1].move(0, -PlayerSpeed * deltaT / 10);
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
