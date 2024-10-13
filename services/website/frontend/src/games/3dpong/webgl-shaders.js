const vsSource = 
`
	precision mediump float;

	attribute vec4 vertPosition;
	attribute vec4 vertColor;

	uniform mat4 mtpMatrix;

	varying lowp vec4 vColor;

	void main()
	{
		gl_Position = mtpMatrix * vertPosition;
		vColor = vertColor;
	}
`;

const fsSource = 
`
	precision mediump float;

	varying lowp vec4 vColor;

	void main()
	{
		gl_FragColor = vColor;

	}
`;

export { vsSource };
export { fsSource };