var instance = null;

function initWebGL(id) {
  const canvas = document.getElementById(id);
  const gl = canvas.getContext("webgl");

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  return gl;
}

export default function instanceFoo() {
  if (instance == null) {
    instance = initWebGL("webGL")
  }

  return instance;
}

