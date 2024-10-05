const vsSource = 
`
	precision mediump float;

	attribute vec4 vertPosition;

	void main()
	{
		gl_Position = vertPosition;
	}
`;

const fsSource = 
`
	precision mediump float;

	void main()
	{
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}
`;

export { vsSource };
export { fsSource };