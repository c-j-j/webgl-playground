import gl from './webgl';
import { Matrix, Vector } from 'sylvester';
import { mat4 } from 'gl-matrix';

const FRAGMENT_SHADER_TEXT = `
  precision mediump float;
  varying vec4 vColour;

  void main(void) {
    gl_FragColor = vColour;
  }
`

const VERTEX_SHADER_TEXT = `
  attribute vec3 aVertexPosition;
  attribute vec4 aVertexColour;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  varying vec4 vColour;

  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vColour = aVertexColour;
  }
`

document.addEventListener('DOMContentLoaded', () => {
  start3dApp();
  console.log('Initialized app');
});

function start3dApp() {
  let shaderProgram = initShaders();
  let cubePositionsBuffer = initCubeBuffer();
  let cubeColourBuffer = initCubeColourBuffer();
  let cubeElementIndexBuffer = initCubeElementArrayBuffer();

  animate3dScene(shaderProgram, cubePositionsBuffer, cubeColourBuffer, cubeElementIndexBuffer, 0.0);
}

function animate3dScene(shaderProgram, positionBuffer, colourBuffer, elementIndexBuffer, rotation) {
  clearScreen();
  draw3dScene(shaderProgram, positionBuffer, colourBuffer, elementIndexBuffer, rotation);

  requestAnimationFrame(() => animate3dScene(shaderProgram, positionBuffer, colourBuffer, elementIndexBuffer, rotation + 0.1));
}

function start2dApp() {
  let shaderProgram = initShaders();
  let triangleBuffer = initTriangleBuffer();
  let triangleColourBuffer = initTriangleColourBuffer();

  drawScene(triangleBuffer, triangleColourBuffer, shaderProgram);
}

function draw3dScene(shaderProgram, positionBuffer, colourBuffer, elementIndexBuffer, rotation) {
  const perspectiveMatrix = createPerspectiveMatrix();
  let modelViewMatrix = createModelViewMatrix();

  translate(modelViewMatrix, [-3.0, -2.0, -7.0]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [1, 1, 1]);
  gl().bindBuffer(gl().ARRAY_BUFFER, positionBuffer);
  gl().vertexAttribPointer(shaderProgram.vertexPositionAttribute, positionBuffer.itemSize, gl().FLOAT, false, 0, 0);

  gl().bindBuffer(gl().ARRAY_BUFFER, colourBuffer);
  gl().vertexAttribPointer(shaderProgram.vertexColourAttribute, colourBuffer.itemSize, gl().FLOAT, false, 0, 0);

  gl().bindBuffer(gl().ELEMENT_ARRAY_BUFFER, elementIndexBuffer);
  setMatrixUniforms(perspectiveMatrix, modelViewMatrix, shaderProgram);
  gl().drawElements(gl().TRIANGLES, elementIndexBuffer.numItems, gl().UNSIGNED_SHORT, 0);
}

function drawScene(triangleBuffer, triangleColourBuffer, shaderProgram) {
  clearScreen();
  const perspectiveMatrix = createPerspectiveMatrix();
  let modelViewMatrix = createModelViewMatrix();

  translate(modelViewMatrix, [-4.0, 2.0, -7.0]);

  let normalized = false;
  let stride = 0;
  let offset = 0;
  let startingIndex = 0;

  gl().bindBuffer(gl().ARRAY_BUFFER, triangleBuffer);

  //this corresponds with the attribute aVertexPosition
  gl().vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleBuffer.itemSize, gl().FLOAT, normalized, stride, offset);

  gl().bindBuffer(gl().ARRAY_BUFFER, triangleColourBuffer);

  //this corresponds with the attribute aVertexColour
  gl().vertexAttribPointer(shaderProgram.vertexColourAttribute, 4, gl().FLOAT, normalized, stride, offset);

  setMatrixUniforms(perspectiveMatrix, modelViewMatrix, shaderProgram);
  gl().drawArrays(gl().TRIANGLES, startingIndex, triangleBuffer.numItems);
}

function translate(matrix, vector) {
  mat4.translate(matrix, matrix, vector);
}

function createModelViewMatrix() {
  let matrix = mat4.create();
  mat4.identity(matrix);

  return matrix;
}

function createPerspectiveMatrix() {
  let matrix = mat4.create();
  mat4.perspective(matrix, 45, 640.0 / 480.0, 0.1, 100.0);
  return matrix;
}

function clearScreen() {
  gl().clear(gl().COLOR_BUFFER_BIT | gl().DEPTH_BUFFER_BIT);
}

function setMatrixUniforms(perspectiveMatrix, modelViewMatrix, shaderProgram) {
  let transposeMatrix = false;

  gl().uniformMatrix4fv(shaderProgram.pMatrixUniform, transposeMatrix, perspectiveMatrix);
  gl().uniformMatrix4fv(shaderProgram.mvMatrixUniform, transposeMatrix, modelViewMatrix);
}

function initTriangleBuffer() {
  return createBufferWith([
    0.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0], 3);
}

function initTriangleColourBuffer() {
  return createBufferWith([
    1.0,  0.0,  0.0, 1.0,
    0.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 1.0], 4);
}

function createBufferWith(vertices, vertexSize) {
  let buffer = gl().createBuffer();
  gl().bindBuffer(gl().ARRAY_BUFFER, buffer);

  buffer.itemSize = vertexSize;
  buffer.numItems = vertices.length / vertexSize;

  gl().bufferData(gl().ARRAY_BUFFER, new Float32Array(vertices), gl().STATIC_DRAW);
  return buffer;
}

function initCubeBuffer() {
  let buffer = gl().createBuffer();
  gl().bindBuffer(gl().ARRAY_BUFFER, buffer);

  const vertices = [
    // Front face
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    1.0,  1.0,  1.0,
    1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0,  1.0,  1.0,
    1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

  gl().bufferData(gl().ARRAY_BUFFER, new Float32Array(vertices), gl().STATIC_DRAW);
  buffer.itemSize = 3;
  buffer.numItems = 24;

  return buffer;
}

function initCubeColourBuffer() {
  let buffer = gl().createBuffer();
  gl().bindBuffer(gl().ARRAY_BUFFER, buffer);

  const colors = [
    [1.0, 0.0, 0.0, 1.0],     // Front face
    [1.0, 1.0, 0.0, 1.0],     // Back face
    [0.0, 1.0, 0.0, 1.0],     // Top face
    [1.0, 0.5, 0.5, 1.0],     // Bottom face
    [1.0, 0.0, 1.0, 1.0],     // Right face
    [0.0, 0.0, 1.0, 1.0],     // Left face
  ];

  var unpackedColors = [];
  for (var i in colors) {
    var color = colors[i];
    for (var j=0; j < 4; j++) {
      unpackedColors = unpackedColors.concat(color);
    }
  }

  gl().bufferData(gl().ARRAY_BUFFER, new Float32Array(unpackedColors), gl().STATIC_DRAW);
  buffer.itemSize = 4;
  buffer.numItems = 24;

  return buffer;
}

function initCubeElementArrayBuffer() {
  let buffer = gl().createBuffer();
  gl().bindBuffer(gl().ELEMENT_ARRAY_BUFFER, buffer);

  var cubeVertexIndices = [
    0, 1, 2,      0, 2, 3,    // Front face
    4, 5, 6,      4, 6, 7,    // Back face
    8, 9, 10,     8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15, // Bottom face
    16, 17, 18,   16, 18, 19, // Right face
    20, 21, 22,   20, 22, 23  // Left face
  ];
  gl().bufferData(gl().ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl().STATIC_DRAW);
  buffer.itemSize = 1;
  buffer.numItems = 36;
  return buffer;

}

function initShaders() {
  let fragmentShader = getFragmentShader();
  let vertexShader = getVertexShader();

  let shaderProgram = gl().createProgram();
  gl().attachShader(shaderProgram, fragmentShader);
  gl().attachShader(shaderProgram, vertexShader);
  gl().linkProgram(shaderProgram);

  if (!gl().getProgramParameter(shaderProgram, gl().LINK_STATUS)) {
    alert("Unable to initialize the shader program");
  }

  gl().useProgram(shaderProgram);

  let vertexPositionAttribute = gl().getAttribLocation(shaderProgram, "aVertexPosition");
  shaderProgram.vertexPositionAttribute = vertexPositionAttribute;
  gl().enableVertexAttribArray(vertexPositionAttribute);

  shaderProgram.vertexColourAttribute = gl().getAttribLocation(shaderProgram, "aVertexColour");
  gl().enableVertexAttribArray(shaderProgram.vertexColourAttribute);

  shaderProgram.pMatrixUniform = gl().getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl().getUniformLocation(shaderProgram, "uMVMatrix");
  return shaderProgram;
}

function getVertexShader() {
  return getShader(gl().VERTEX_SHADER, VERTEX_SHADER_TEXT);
}

function getFragmentShader() {
  return getShader(gl().FRAGMENT_SHADER, FRAGMENT_SHADER_TEXT);
}

function getShader(type, shaderText) {
  let shader = gl().createShader(type);

  gl().shaderSource(shader, shaderText);
  gl().compileShader(shader);

  if(!gl().getShaderParameter(shader, gl().COMPILE_STATUS)) {
    throw new Error(gl().getShaderInfoLog(shader));
  }

  return shader;
}
