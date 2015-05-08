/*
 * Name:	James Tremper
 * Date:	2015-05-07
 * Desc:	Lab 4 Submission
 *
 * References:
 *	Learning WebGL - Lesson 5 - http://learningwebgl.com/blog/?p=507
 *
 */

var gl;

var shaderProgram;

var mvMatrix = mat4();
var pMatrix = mat4();

var vPositionBuffer;
//var vColorBuffer;
var textureCoordBuffer;
var vNormalBuffer;

var rotationX = 0;
var rotationY = 0;

var checkerboardTexture;


function inverse(a, b)
{
	var c=a[0], d=a[1], e=a[2],
		f=a[4], g=a[5], h=a[6],
		i=a[8], j=a[9], k=a[10];

	var l = k*g - h*j;
	var o =-k*f + h*i;
	var m = j*f - g*i;
	var n = c*l + d*o +e*m;

	if (!n) return null;
	b || (b = mat3());
	n = 1/n;
	b[0] = l*n; b[1] = (-k*d + e*j)*n; b[2] = ( h*d - e*g)*n;
	b[3] = o*n; b[4] = ( k*c - e*i)*n; b[5] = (-h*c - e*i)*n;
	b[6] = m*n; b[7] = (-j*c + d*i)*n; b[8] = ( g*c - d*f)*n;

	return b;
}


/*
 * Initializes the gl element
 * Called from webGLStart
 */
function initGL(canvas)
{
	gl = canvas.getContext("experimental-webgl");	// QUESTION: "exerimental-webgl"?
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;

	if (!gl) { alert("Could not initialize WebGL."); }
}


/*
 * Returns a shader object with a given id
 * Called from initShaders
 */
function getShader(gl, id)
{
	var shaderScript = document.getElementById(id);
	if (!shaderScript) { return null; }

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) { str += k.textContent; }	// QUESTION: Whats this line for?
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") { shader = gl.createShader(gl.FRAGMENT_SHADER); }
	else if (shaderScript.type == "x-shader/x-vertex") { shader = gl.createShader(gl.VERTEX_SHADER); }
	else { return null; }

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


/*
 * Initializes shader variables
 * Called from webGLStart
 */
function initShaders()
{
// Create shader variables
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { alert("Could not initialize shaders"); }

	gl.useProgram(shaderProgram);

// Do piping
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

//	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
//	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
	shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}


/*
 * QUESTION: What does this do?
 * Called from drawScene
 */
function setMatrixUniforms()
{
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, flatten(pMatrix));
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, flatten(mvMatrix));

	var normalMatrix = mat3();
	normalMatrix = inverse(flatten(mvMatrix));
	normalMatrix = mat3(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, flatten(normalMatrix));
}


/*
 * Initializes buffers
 * Called by webGLStart
 */
function initBuffers()
{
	vPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vPositionBuffer);
	var vertices = [
		// Top Front face
		 0.0,  1.0,  0.0,
		-0.5,  0.0,  0.5,
		 0.5,  0.0,  0.5,

		// Top Right face
		 0.0,  1.0,  0.0,
		 0.5,  0.0,  0.5,
		 0.5,  0.0, -0.5,

		// Top Back face
		 0.0,  1.0,  0.0,
		 0.5,  0.0, -0.5,
		-0.5,  0.0, -0.5,

		// Top Left face
		 0.0,  1.0,  0.0,
		-0.5,  0.0, -0.5,
		-0.5,  0.0,  0.5,

		// Bottom Front face
		 0.0, -1.0,  0.0,
		-0.5,  0.0,  0.5,
		 0.5,  0.0,  0.5,

		// Bottom Right face
		 0.0, -1.0,  0.0,
		 0.5,  0.0,  0.5,
		 0.5,  0.0, -0.5,

		// Bottom Back face
		 0.0, -1.0,  0.0,
		 0.5,  0.0, -0.5,
		-0.5,  0.0, -0.5,

		// Bottom Left face
		 0.0, -1.0,  0.0,
		-0.5,  0.0, -0.5,
		-0.5,  0.0,  0.5
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	vPositionBuffer.itemSize = 3;
	vPositionBuffer.numItems = 24;

/*
	vColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vColorBuffer);
	var colors = [
		// Top Front face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,

		// Top Right face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,

		// Top Back face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,

		// Top Left face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,

		// Bottom Front face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,

		// Bottom Right face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,

		// Bottom Back face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,

		// Bottom Left face
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	vColorBuffer.itemSize = 4;
	vColorBuffer.numItems = 24;
*/

	textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	var textCoords = [
		// Top Front face
		0.5, 1.0,
		0.0, 0.0,
		1.0, 0.0,

		// Top Right face
		0.5, 1.0,
		0.0, 0.0,
		1.0, 0.0,

		// Top Back face
		0.5, 1.0,
		0.0, 0.0,
		1.0, 0.0,

		// Top Left face
		0.5, 1.0,
		0.0, 0.0,
		1.0, 0.0,

		// Bottom Front face
		0.5, 0.0,
		0.0, 1.0,
		1.0, 1.0,

		// Bottom Right face
		0.5, 0.0,
		0.0, 1.0,
		1.0, 1.0,

		// Bottom Back face
		0.5, 0.0,
		0.0, 1.0,
		1.0, 1.0,

		// Bottom Left face
		0.5, 0.0,
		0.0, 1.0,
		1.0, 1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textCoords), gl.STATIC_DRAW);
	textureCoordBuffer.itemSize = 2;
	textureCoordBuffer.numItems = 24;

	vNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vNormalBuffer);
	var normals = [
		// Top Front face
		 0.0,  0.5,  1.0,
		 0.0,  0.5,  1.0,
		 0.0,  0.5,  1.0,

		// Top Right face
		 1.0,  0.5,  0.0,
		 1.0,  0.5,  0.0,
		 1.0,  0.5,  0.0,

		// Top Back face
		 0.0,  0.5, -1.0,
		 0.0,  0.5, -1.0,
		 0.0,  0.5, -1.0,

		// Top Left face
		-1.0,  0.5,  0.0,
		-1.0,  0.5,  0.0,
		-1.0,  0.5,  0.0,

		// Bottom Front face
		 0.0, -0.5,  1.0,
		 0.0, -0.5,  1.0,
		 0.0, -0.5,  1.0,

		// Bottom Right face
		 1.0, -0.5,  0.0,
		 1.0, -0.5,  0.0,
		 1.0, -0.5,  0.0,

		// Bottom Back face
		 0.0, -0.5, -1.0,
		 0.0, -0.5, -1.0,
		 0.0, -0.5, -1.0,

		// Bottom Left face
		-1.0, -0.5,  0.0,
		-1.0, -0.5,  0.0,
		-1.0, -0.5,  0.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	vNormalBuffer.itemSize = 3;
	vNormalBuffer.numItems = 24;
}


/*
 * Handles texture
 */
function handleLoadedTexture(texture)
{
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}


/*
 * Initialize texture
 */
function initTexture()
{
	checkerboardTexture = gl.createTexture();
	checkerboardTexture.image = new Image();
	checkerboardTexture.image.onload = function() {
		handleLoadedTexture(checkerboardTexture);
	}
	checkerboardTexture.image.src = "./checkerboard.gif";
}


/*
 * Called from tick
 */
function drawScene()
{
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	// QUESTION: Why do you need to clear these?

	pMatrix = perspective( 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100,0);

	mvMatrix = mat4();
	mvMatrix = mult(mvMatrix, translate(0, 0, -5));
	mvMatrix = mult(mvMatrix, rotate(rotationX, [0, 1, 0]));
	mvMatrix = mult(mvMatrix, rotate(rotationY, [1, 0, 0]));

	gl.bindBuffer(gl.ARRAY_BUFFER, vPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

/*
	gl.bindBuffer(gl.ARRAY_BUFFER, vColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
*/
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, vNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, vNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.uniform3f( shaderProgram.ambientColorUniform, 0.1, 0, 0);
	var lightingDirection = [1, 0.5, 0.2];
	var adjustedLD = vec3();
	adjustedLD = normalize(lightingDirection);
	gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);
	gl.uniform3f(shaderProgram.directionalColorUniform, 0, 0, 1);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLES, 0, vPositionBuffer.numItems);
}


/*
 * Calls rendering functions
 * Called from webGLStart
 */
function tick()
{
	requestAnimFrame(tick);
	drawScene();
}


/*
 * Main Function
 */
window.onload = function webGLStart()
{
	var canvas = document.getElementById("gl-canvas");
	initGL(canvas);
	initShaders();
	initBuffers();
	initTexture();

	gl.clearColor(0, 0, 0, 1);
	gl.enable(gl.DEPTH_TEST);	// QUESTION: What is DEPTH_TEST for?

	tick();
}

document.addEventListener("keydown", function(event) {
	switch(event.keyCode) {
	case 37:
		rotationX += 10; break;
	case 39:
		rotationX -= 10; break;
	case 38:
		rotationY -= 10; break;
	case 40:
		rotationY += 10; break;
	case 36:
		rotationX = 0; rotationY = 0;
	}
} );
