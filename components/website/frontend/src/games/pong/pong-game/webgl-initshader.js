import { vsSource } from "./webgl-shaders";
import { fsSource } from "./webgl-shaders";

/**
 * 
 * @param {WebGLRenderingContext} gl 
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
		console.warning(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
		return null;
	}
	
	const programInfo = {
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
 * @param {WebGLRenderingContext} gl 
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
		console.warning(`ERROR: could not compile: ${getWebGLConstantName(gl, type)}: ${gl.getShaderInfoLog(shader)}`);
		return null;
	}
	return shader;
}

export { initShaders };