import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors } from '@catppuccin/palette';

var canvas = document.getElementById('gameField')
/** @type {CanvasRenderingContext2D} */
var ctx = canvas.getContext('2d');

// some constants for the elements rendering
var middleX = canvas.width / 2;
var middleY = canvas.height / 2;
var paddleHeight = canvas.height / 5;
var paddleWidth = paddleHeight / 9;
var ballSize = canvas.height / 50 * 1.5;
var ballDisplace = ballSize / 2;

document.addEventListener('DOMContentLoaded', init);

//Going for an oop approach, not too sure of how it works in js yet

class Ball { 
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	draw() {
		ctx.fillRect(this.x - ballDisplace, this.y - ballDisplace , ballSize, ballSize);
	}
}

class Player {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	draw() {
		ctx.fillRect(this.x - paddleWidth / 2, this.y - paddleHeight / 2, paddleWidth, paddleHeight);
	}

}

//this makes it easier to scale more than 2 players if we do it

function renderField2d(ballList, playerList)
{
	var colors = flavors[getTheme().split('-').pop()].colors;
	ctx.fillStyle = colors.surface2.hex;
	
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
