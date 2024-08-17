import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors, flavorEntries } from '@catppuccin/palette';

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

function renderField2d(ballX, ballY, p1, p2)
{
	ballX = (typeof ballX === undefined) ? middleX : ballX;
	ballY = (typeof ballY === undefined) ? middleY : ballY;
	
	p1 = (typeof p1 === undefined) ? middleY : p1;
	p2 = (typeof p2 === undefined) ? middleY : p2;
	var colors = flavors[getTheme().split('-').pop()].colors;
	ctx.fillStyle = colors.overlay0.hex;
	
	ctx.fillRect(0, p1 - paddleHeight / 2, paddleWidth, paddleHeight);
	ctx.fillRect(canvas.width - paddleWidth, p2 - paddleHeight / 2, paddleWidth, paddleHeight);
	ctx.fillRect(ballX - ballDisplace, ballY - ballDisplace , ballSize, ballSize);
}

window.render = renderField2d;
