import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors, flavorEntries } from '@catppuccin/palette';

var canvas = document.getElementById('gameField')
var ctx = canvas.getContext('2d');

document.addEventListener('DOMContentLoaded', renderField2d);
setInterval(renderField2d, 13); // bro.

function renderField2d(canvas, ballX, ballY, p1x, p2x)
{
	var colors = flavors[getTheme().split('-').pop()].colors;
	ctx.fillStyle = colors.overlay0.hex;
	ctx.fillRect(50, 50, 100, 100);
}

window.render = renderField2d;
