class Cube {
  constructor() {
    this.verticesColorsUV = new Float32Array([
      1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, 1, 1, 1, 0, 1, -1, -1, 1, 1, 1, 1, 0, 0,
      1, -1, 1, 1, 1, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 1, -1, -1, 1, 1, 1, 0,
      0, -1, -1, -1, 1, 1, 1, 1, 0, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, 1,
      1, 1, -1, 1, -1, 1, 1, 1, 0, 1, -1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1,
      1, 0, 1, -1, 1, 1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, 0, 1, -1, -1, -1, 1, 1,
      1, 0, 0, 1, -1, -1, 1, 1, 1, 1, 0, 1, 1, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 0, 1, 1, -1, 1, 1, 1, 1, 0, 0, 1, -1, -1, 1, 1, 1, 1, 0, -1, 1, 1, 1,
      1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 0, 1, -1, -1, -1, 1, 1, 1, 0, 0, -1, -1,
      1, 1, 1, 1, 1, 0,
    ]);

    this.indices = new Uint8Array([
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
      14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
    ]);

    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.indexCount = this.indices.length;
  }

  initBuffers(gl, program) {
    const FSIZE = this.verticesColorsUV.BYTES_PER_ELEMENT;

    this.vertexBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.verticesColorsUV, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(program, 'a_Position');
    const a_Color = gl.getAttribLocation(program, 'a_Color');
    const a_UV = gl.getAttribLocation(program, 'a_UV');

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 6);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  }

  bindBuffers(gl, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    const FSIZE = this.verticesColorsUV.BYTES_PER_ELEMENT;

    const a_Position = gl.getAttribLocation(program, 'a_Position');
    const a_Color = gl.getAttribLocation(program, 'a_Color');
    const a_UV = gl.getAttribLocation(program, 'a_UV');

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 6);
    gl.enableVertexAttribArray(a_UV);
  }
}
