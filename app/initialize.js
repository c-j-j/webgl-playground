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
  let buffer = initBuffers();
  drawScene(buffer, shaderProgram);
}

function drawScene(buffer, shaderProgram) {
  clearScreen();

  let pMatrix = mat4.create();
  let mvMatrix = mat4.create();
  mat4.perspective(pMatrix, 45, 640.0 / 480.0, 0.1, 100.0);

  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, mvMatrix, [-4.0, 2.0, -7.0]);

  gl().vertexAttribPointer(shaderProgram.vertexPositionAttribute, buffer.itemSize, gl().FLOAT, false, 0, 0);

  setMatrixUniforms(pMatrix, mvMatrix, shaderProgram);

  gl().drawArrays(gl().TRIANGLES, 0, buffer.numItems);
}

function clearScreen() {
  gl().clear(gl().COLOR_BUFFER_BIT | gl().DEPTH_BUFFER_BIT);
}

function setMatrixUniforms(pMatrix, mvMatrix, shaderProgram) {
  gl().uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl().uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function initBuffers() {
  let buffer = gl().createBuffer();
  gl().bindBuffer(gl().ARRAY_BUFFER, buffer);

  let vertices = [
    0.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
    1.0, -1.0,  0.0,
    0.0, -1.0,  0.0,
  ];

  buffer.itemSize = 2;
  buffer.numItems = 3;

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
