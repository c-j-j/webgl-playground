import gl from './webgl';
import { Matrix, Vector } from 'sylvester';
import { mat4 } from 'gl-matrix';

const FRAGMENT_SHADER_TEXT = `
void main(void) {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`

const VERTEX_SHADER_TEXT = `
  attribute vec3 aVertexPosition;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  }
`

document.addEventListener('DOMContentLoaded', () => {
  start();
  console.log('Initialized app');
});

function start() {
  let shaderProgram = initShaders();
  let squareBuffer = initSquareBuffer();
  let triangleBuffer = initTriangleBuffer();
  clearScreen();
  drawScene(triangleBuffer, squareBuffer, shaderProgram);
}

function drawScene(triangleBuffer, squareBuffer, shaderProgram) {
  const perspectiveMatrix = createPerspectiveMatrix();
  let modelViewMatrix = createModelViewMatrix();

  translate(modelViewMatrix, [-4.0, 2.0, -7.0]);

  drawBuffer({ buffer: triangleBuffer,
               shaderProgram: shaderProgram,
               modelViewMatrix: modelViewMatrix,
               perspectiveMatrix: perspectiveMatrix });

  translate(modelViewMatrix, [3.0, 0.0, 0.0]);

  drawBuffer({ buffer: squareBuffer,
               shaderProgram: shaderProgram,
               modelViewMatrix: modelViewMatrix,
               perspectiveMatrix: perspectiveMatrix });
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

function drawBuffer({ buffer, shaderProgram, modelViewMatrix, perspectiveMatrix }) {
  let index = shaderProgram.vertexPositionAttribute;
  let stepSize = buffer.itemSize;
  let type = gl().FLOAT;
  let normalized = false;
  let stride = 0;
  let offset = 0;
  let startingIndex = 0;

  gl().bindBuffer(gl().ARRAY_BUFFER, buffer);
  gl().vertexAttribPointer(index, stepSize, type, normalized, stride, offset);
  setMatrixUniforms(perspectiveMatrix, modelViewMatrix, shaderProgram);
  gl().drawArrays(gl().TRIANGLE_STRIP, startingIndex, buffer.numItems);
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
    1.0, -1.0,  0.0
  ]);
}

function initSquareBuffer() {
  return createBufferWith([
    -1.0, -1.0,  0.0,
    -1.0,  1.0,  0.0,
    1.0, 1.0,  0.0,
    1.0, -1.0,  0.0,
    -1.0, -1.0,  0.0,
  ]);
}

function createBufferWith(vertices) {
  let buffer = gl().createBuffer();
  gl().bindBuffer(gl().ARRAY_BUFFER, buffer);

  buffer.itemSize = 3;
  buffer.numItems = vertices.length / 3;

  gl().bufferData(gl().ARRAY_BUFFER, new Float32Array(vertices), gl().STATIC_DRAW);
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
