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
var ballSize = canvas.height / 50 * 1.25;
var ballDisplace = ballSize / 2;

document.addEventListener('DOMContentLoaded', init);

//Going for an oop approach, not too sure of how it works in js yet 

function removeDuplicatePoints(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

class Polygon {
	constructor(verticeList) {
		removeDuplicatePoints(verticeList);
		this.verticeList = verticeList;
	}
	getVertices() { return this.verticeList}
	render() {
		ctx.beginPath();
		ctx.moveTo(this.verticeList[0][0], this.verticeList[0][1]);
		for (var i = 1; i < this.verticeList.length; i++) {
			ctx.lineTo(this.verticeList[i][0], this.verticeList[i][1]);
		}
		ctx.closePath();
		ctx.stroke();
		ctx.fill('evenodd');
	}
	//Xmove an Ymove correspond to the amount in each direction to move
	//eg: [-1, +2] moves all the vertices 1 left and 2 down
	moveVertices(Xmove, Ymove){
		this.verticeList.forEach(vertice => {
			vertice[0] += Xmove;
			vertice[1] += Ymove;
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
	var trianglesA = earcut(PolygonA.getVertices);

	
}

//this makes it easier to scale more than 2 players if we do it

function renderField2d(ballList, playerList)
{
	var colors = flavors[getTheme().split('-').pop()].colors;
	ctx.fillStyle = colors.surface2.hex;
	ctx.strokeStyle = colors.surface2.hex;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ballList.forEach(ball => {
		ball.draw();
	});
	playerList.forEach(player => {
		player.draw();
	})
}

//I have no clue on how I'm going to get controls to work but hey now it renders something at least

function gameLoop(players, balls)
{
	renderField2d(balls, players);
	requestAnimationFrame(() => gameLoop(players, balls));
}

function init(){
	const players = [
		new Player(paddleWidth / 2, middleY, [ShapeMaker.makeRectangle_mid(paddleWidth / 2, middleY, paddleWidth, paddleHeight)]),
		new Player(canvas.width - paddleWidth / 2, middleY, [ShapeMaker.makeRectangle_mid(canvas.width - paddleWidth / 2, middleY, paddleWidth, paddleHeight)]),
	]

	const balls = [
		new Ball(middleX, middleY, [ShapeMaker.makeRectangle_mid(middleX, middleY, ballSize, ballSize)])
	]
	balls[0].rotate(45);
	gameLoop(players, balls);
}
