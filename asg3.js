var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec2 a_UV;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjectionMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec2 v_UV;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '  v_UV = a_UV;\n' +
  '}\n';

var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'varying vec2 v_UV;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'uniform float u_texColorWeight;\n' +
  'uniform vec4 u_baseColor;\n' +
  'void main() {\n' +
  '  vec4 texColor = texture2D(u_Sampler, v_UV);\n' +
  '  gl_FragColor = mix(u_baseColor, texColor, u_texColorWeight);\n' +
  '}\n';

var gl;
var u_Sampler, u_texColorWeight, u_baseColor;
var u_ModelMatrix, u_ViewMatrix, u_ProjectionMatrix;

var cube, groundCube, skyboxCube;
var modelMatrix = new Matrix4();
var camera;

let blockTexture, stoneTexture, nightTexture, grassTexture, diamondTexture;
let isNight = false;

let frameCount = 0;
let lastFpsUpdate = performance.now();
let isDragging = false;
let lastMouseX = 0;

const cubes = [];

function setupWebGl() {
  const canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas);
}

function initVars() {
  initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
}

function main() {
  setupWebGl();
  initVars();

  cube = new Cube();
  cube.initBuffers(gl, gl.program);
  groundCube = new Cube();
  groundCube.initBuffers(gl, gl.program);
  skyboxCube = new Cube();
  skyboxCube.initBuffers(gl, gl.program);

  camera = new Camera(document.getElementById('webgl'));

  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  u_baseColor = gl.getUniformLocation(gl.program, 'u_baseColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  loadTexture('block.jpg', (tex1) => {
    blockTexture = tex1;
    loadTexture('stone.png', (tex2) => {
      stoneTexture = tex2;
      loadTexture('night.jpg', (tex3) => {
        nightTexture = tex3;
        loadTexture('grass.png', (tex4) => {
          grassTexture = tex4;
          loadTexture('diamond.png', (tex5) => {
            diamondTexture = tex5;

            cubes.push({ x: 5, y: 0.5, z: -3, texture: 'stone' });
            cubes.push({ x: 3, y: 0.5, z: 3, texture: 'stone' });
            cubes.push({ x: -1, y: 0.5, z: 4, texture: 'diamond' });

            requestAnimationFrame(animate);
          });
        });
      });
    });
  });

  window.addEventListener('keydown', handleKeyDown);
  const canvas = document.getElementById('webgl');
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
  });
  canvas.addEventListener('mouseup', () => (isDragging = false));
  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) onMouseMove(e);
  });
  document.getElementById('nightBtn')?.addEventListener('click', toggleSky);
}

function loadTexture(src, callback) {
  const tex = gl.createTexture();
  const img = new Image();
  img.onload = () => {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    callback(tex);
  };
  img.src = src;
}

function animate() {
  drawScene();
  requestAnimationFrame(animate);
}

function drawCube(texture, tx, ty, tz) {
  modelMatrix.setIdentity();
  modelMatrix.translate(tx, ty, tz);
  modelMatrix.scale(0.5, 0.5, 0.5);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.uniform4f(u_baseColor, 1, 1, 1, 1);
  gl.uniform1f(u_texColorWeight, 1.0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(u_Sampler, 0);
  cube.bindBuffers(gl, gl.program);
  gl.drawElements(gl.TRIANGLES, cube.indexCount, gl.UNSIGNED_BYTE, 0);
}

function handleKeyDown(ev) {
  if (ev.key === 'w') camera.moveForward();
  else if (ev.key === 's') camera.moveBackward();
  else if (ev.key === 'a') camera.moveRight();
  else if (ev.key === 'd') camera.moveLeft();
  else if (ev.key === 'q') camera.panLeft();
  else if (ev.key === 'e') camera.panRight();
  else if (ev.key === 'x') deleteStoneCubeInFront();
  else if (ev.key === 'c') placeStoneCubeInFront();
}

function onMouseMove(e) {
  const deltaX = e.clientX - lastMouseX;
  lastMouseX = e.clientX;
  const sensitivity = 0.3;
  camera.panLeft(-deltaX * sensitivity);
}

function deleteStoneCubeInFront() {
  const forward = new Vector3([
    camera.at.elements[0] - camera.eye.elements[0],
    camera.at.elements[1] - camera.eye.elements[1],
    camera.at.elements[2] - camera.eye.elements[2],
  ]);
  forward.normalize();

  for (let i = 0; i < cubes.length; i++) {
    const c = cubes[i];
    if (c.texture !== 'stone' && c.texture !== 'diamond') continue;

    const dx = c.x - camera.eye.elements[0];
    const dy = c.y - camera.eye.elements[1];
    const dz = c.z - camera.eye.elements[2];
    const toCube = new Vector3([dx, dy, dz]);
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    toCube.normalize();
    const dot = dotProduct(forward, toCube);

    if (dot > 0.5 && dist < 5) {
      if (c.texture === 'diamond') {
        const oldCrosshair = document.getElementById('crosshair');

        const img = document.createElement('img');
        img.id = 'crosshair';
        img.src = 'pickaxe.png';
        img.style.position = 'absolute';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.width = '20px';
        img.style.height = '20px';
        img.style.transform = 'translate(-50%, -50%)';
        img.style.pointerEvents = 'none';
        img.style.zIndex = '1000';

        oldCrosshair.parentNode.replaceChild(img, oldCrosshair);

        document.getElementById('story').style.display = 'block';
      }

      cubes.splice(i, 1);
      break;
    }
  }
}

function placeStoneCubeInFront() {
  const forward = new Vector3([
    camera.at.elements[0] - camera.eye.elements[0],
    camera.at.elements[1] - camera.eye.elements[1],
    camera.at.elements[2] - camera.eye.elements[2],
  ]);
  forward.normalize();

  const offset = 2.0;
  const newPos = [
    camera.eye.elements[0] + forward.elements[0] * offset,
    camera.eye.elements[1] + forward.elements[1] * offset,
    camera.eye.elements[2] + forward.elements[2] * offset,
  ];

  const snapped = newPos.map((v) => Math.round(v * 2) / 2);

  for (let c of cubes) {
    if (
      Math.abs(c.x - snapped[0]) < 0.1 &&
      Math.abs(c.y - snapped[1]) < 0.1 &&
      Math.abs(c.z - snapped[2]) < 0.1
    ) {
      return;
    }
  }

  cubes.push({ x: snapped[0], y: snapped[1], z: snapped[2], texture: 'stone' });
}

function dotProduct(v1, v2) {
  const a = v1.elements;
  const b = v2.elements;
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function drawScene() {
  frameCount++;
  const now = performance.now();
  if (now - lastFpsUpdate >= 500) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
    document.getElementById('fps').textContent = `FPS: ${fps}`;
    lastFpsUpdate = now;
    frameCount = 0;
  }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.depthMask(false);
  gl.disable(gl.CULL_FACE);
  modelMatrix.setIdentity();
  modelMatrix.translate(...camera.eye.elements);
  modelMatrix.scale(100, 100, 100);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(
    u_ProjectionMatrix,
    false,
    camera.projectionMatrix.elements
  );
  if (isNight) {
    gl.bindTexture(gl.TEXTURE_2D, nightTexture);
    gl.uniform1f(u_texColorWeight, 1.0);
  } else {
    gl.uniform4f(u_baseColor, 0.5, 0.7, 1.0, 1.0);
    gl.uniform1f(u_texColorWeight, 0.0);
  }
  gl.uniform1i(u_Sampler, 0);
  skyboxCube.bindBuffers(gl, gl.program);
  gl.drawElements(gl.TRIANGLES, skyboxCube.indexCount, gl.UNSIGNED_BYTE, 0);
  gl.depthMask(true);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  modelMatrix.setIdentity();
  modelMatrix.scale(20, 0.1, 20);
  modelMatrix.rotate(-90, 1, 0, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  if (isNight) {
    gl.bindTexture(gl.TEXTURE_2D, grassTexture);
    gl.uniform1f(u_texColorWeight, 1.0);
  } else {
    gl.uniform4f(u_baseColor, 0, 0.8, 0, 1);
    gl.uniform1f(u_texColorWeight, 0.0);
  }
  gl.uniform1i(u_Sampler, 0);
  groundCube.bindBuffers(gl, gl.program);
  gl.drawElements(gl.TRIANGLES, groundCube.indexCount, gl.UNSIGNED_BYTE, 0);

  // grass cubes
  for (let i = 0; i < 3; i++) {
    drawCube(blockTexture, i - 2, 0.5, 0);
    drawCube(blockTexture, i - 2, 1.5, 0);
  }
  for (let i = 0; i < 3; i++) {
    drawCube(blockTexture, i - 2, 0.5, 3);
    drawCube(blockTexture, i - 2, 1.5, 3);
  }
  for (let i = 0; i < 3; i++) {
    drawCube(blockTexture, 0, 0.5, i + 4);
    drawCube(blockTexture, 0, 1.5, i + 4);
  }
  for (let i = 0; i < 3; i++) {
    drawCube(blockTexture, i - 2, 0.5, 6);
    drawCube(blockTexture, i - 2, 1.5, 6);
  }

  for (let i = 0; i < 14; i++) {
    drawCube(blockTexture, -5, 0.5, i - 3);
    drawCube(blockTexture, -5, 1.5, i - 3);
  }

  for (let c of cubes) {
    let texture;
    if (c.texture === 'stone') texture = stoneTexture;
    else if (c.texture === 'diamond') texture = diamondTexture;
    else texture = blockTexture;

    drawCube(texture, c.x, c.y, c.z);
  }
}

function toggleSky() {
  isNight = !isNight;
}
