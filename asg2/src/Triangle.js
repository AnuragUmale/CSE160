class Triangle {
  constructor(
    position_ = [0.0, 0.0, 0.0],
    color_ = [1.0, 1.0, 1.0, 1.0],
    size_ = 5.0,
    vertices_ = []
  ) {
    this.type = "triangle";
    if (vertices_.length == 6) this.position = vertices_[0];
    else this.position = position_;
    this.color = color_;
    this.size = size_;
    this.vertices = vertices_;
  }

  render() {
    var xy = this.position;
    var size = this.size;
    var rgba = this.color;

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

    gl.uniform1f(u_Size, size);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    if (this.vertices.length == 6) {
      drawTriangle(this.vertices);
    } else {
      var d = this.size / 200.0;
      drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
    }
  }
}

function drawTriangle(vertices) {
  var n = 3;

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}
