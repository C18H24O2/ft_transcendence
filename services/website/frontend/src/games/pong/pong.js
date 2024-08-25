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
		ctx.fill();
	}
}

//some default shapes to make my life easier (maybe)

class ShapeMaker {
	static makeTriangle(pointA, pointB, pointC) {}
	static makeRectangle(x, y ,width, height) {
		return new Polygon([[x, y],[x + width, y],[x + width, y + height],[x, y + height]]);
	}
	static makePolygon(x, y, radius, vertNum) {}
	static makePolygon(vertList) {}
}

class Ball { 
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.shape = ShapeMaker.makeRectangle(this.x - ballDisplace, this.y - ballDisplace, ballSize, ballSize);
	}
	draw() {
		this.shape.render();
	}
}

class Player {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.shape = ShapeMaker.makeRectangle(this.x - paddleWidth / 2, this.y - paddleHeight / 2, paddleWidth, paddleHeight);
	}
	draw() {
		this.shape.render();
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
		new Player(paddleWidth / 2, middleY),
		new Player(canvas.width - paddleWidth / 2, middleY),
	]

	const balls = [
		new Ball(middleX, middleY)
	]
	gameLoop(players, balls);
}
