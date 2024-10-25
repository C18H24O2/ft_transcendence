const vsSource = 
`
	precision highp float;

	attribute vec4 vertPosition;
	attribute vec2 textureCoord;
	attribute vec3 vertNormal;

	uniform mat4 mtpMatrix;
	uniform mat4 normalMatrix;

	varying highp vec2 vTextureCoord;
	varying highp vec3 vLighting;

	void main()
	{
		gl_Position = mtpMatrix * vertPosition;
		vTextureCoord = textureCoord;


	// Apply lighting effect

	highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
	highp vec3 directionalLightColor = vec3(1, 1, 1);
	highp vec3 directionalVector = normalize(vec3(0, 0, 1));

	highp vec4 transformedNormal = normalMatrix * vec4(vertNormal, 1.0);

	highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
	vLighting = ambientLight + (directionalLightColor * directional);
	}
`;

const fsSource = 
`
	precision highp float;

	varying highp vec2 vTextureCoord;
	varying highp vec3 vLighting;

	uniform sampler2D uSampler;

	void main()
	{
		highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
		gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
	}
`;

export { vsSource };
export { fsSource };