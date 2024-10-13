import { vsSource } from "./webgl-shaders";
import { fsSource } from "./webgl-shaders";

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @returns {ProgramInfo}
 */

function initShaders(gl)
{
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	{
		console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
		return null;
	}
	
	const programInfo = {
		program: shaderProgram,
		attribLocation: {
			vertexPosition: gl.getAttribLocation(shaderProgram, "vertPosition"),
			vertexColor: gl.getAttribLocation(shaderProgram, "vertColor")
		},
		uniformLocation: {
			mtpMatrix: gl.getUniformLocation(shaderProgram, "mtpMatrix")
		}
	};
	return programInfo;
}

function getWebGLConstantName(gl, value) {
	for (let name in gl) {
		if (gl[name] === value) {
			return name;
		}
	}
	return null;
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {GLenum} type 
 * @param {String} source 
 * @returns {WebGLShader}
 */

function loadShader(gl, type, source)
{
	const shader = gl.createShader(type);

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		console.error(`ERROR: could not compile: ${getWebGLConstantName(gl, type)}: ${gl.getShaderInfoLog(shader)}`);
		return null;
	}
	return shader;
}

export { initShaders };