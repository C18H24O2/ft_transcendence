import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors } from '@catppuccin/palette';
import { initShaders } from './webgl-initshader.js';

main();

function getColors()
{
	return (flavors[getTheme().split('-').pop()].colors);
}

function rgb_to_webgl(color)
{
	return (
		{
			r: color.r / 255, 
			g: color.g / 255,
			b: color.b / 255,
		}
	)
}

function main()
{
	/**@type {HTMLCanvasElement} */
	const canvas = document.getElementById("gameField");

	/**@type {WebGLRenderingContext} */
	const gl = canvas.getContext("webgl", {alpha: true});

	if (!gl)
	{
		console.error('Your browser does not support webgl, consider using a different browser to access this functionnality');
		return;
	}

	/**@type {import('@catppuccin/palette').CatppuccinColors} */
	const colors = getColors();

	const bgColor = rgb_to_webgl(colors.crust.rgb);
	gl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const shaderProgram = initShaders(gl);

	

}
/**
 * 
 * @param {WebGLRenderingContext} gl
 * @param {Float64Array | Float32Array} positions
 * @returns {WebGLBuffer}
 */

function createNewPositionBuffer(gl, positions)
{
	const positionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	return positionBuffer;
}
