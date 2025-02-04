// @ts-check

import { vsSource } from "./webgl-shaders";
import { fsSource } from "./webgl-shaders";

/**
 * @typedef {Object} ProgramInfo
 * @property {WebGLProgram} program
 * @property {AttribLocation} attribLocation
 * @property {UniformLocation} uniformLocation
 */

/**
 * @typedef {Object} AttribLocation
 * @property {GLint} vertexPosition
 * @property {GLint} textureCoord
 * @property {GLint} vertexNormal
 */

/**
 * @typedef {Object} UniformLocation
 * @property {WebGLUniformLocation | null} mtpMatrix
 * @property {WebGLUniformLocation | null} normalMatrix
 * @property {WebGLUniformLocation | null} Sampler
 */

/**
 * @param {WebGLRenderingContext} gl 
 * @returns {ProgramInfo | null} programInfo
 */
function initShaders(gl)
{
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	if (!vertexShader) {
		return null;
	}
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	if (!fragmentShader) {
		return null;
	}

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	{
		console.log(`Notice: Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
		return null;
	}
	
	return {
		program: shaderProgram,
		attribLocation: {
			vertexPosition: gl.getAttribLocation(shaderProgram, "vertPosition"),
			textureCoord: gl.getAttribLocation(shaderProgram, "textureCoord"),
			vertexNormal: gl.getAttribLocation(shaderProgram, "vertNormal"),
		},
		uniformLocation: {
			mtpMatrix: gl.getUniformLocation(shaderProgram, "mtpMatrix"),
			normalMatrix:  gl.getUniformLocation(shaderProgram, "normalMatrix"),
			Sampler: gl.getUniformLocation(shaderProgram, "uSampler"),
		}
	};
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {number} value
 * @returns {string} the name of the constant
 */
function getWebGLConstantName(gl, value) {
	for (let name in gl) {
		if (gl[name] === value) {
			return name;
		}
	}
	return "Unknown WebGL Constant: " + value;
}

/**
 * @param {WebGLRenderingContext} gl 
 * @param {GLenum} type 
 * @param {String} source 
 * @returns {WebGLShader | null}
 */
function loadShader(gl, type, source)
{
	const shader = gl.createShader(type);
	if (!shader) {
		console.log(`ERROR: could not create shader: ${getWebGLConstantName(gl, type)}`);
		return null;
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		console.log(`ERROR: could not compile: ${getWebGLConstantName(gl, type)}: ${gl.getShaderInfoLog(shader)}`);
		return null;
	}
	return shader;
}

export { initShaders };
