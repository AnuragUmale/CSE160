class Point {
  constructor(
    position_ = [0.0, 0.0],
    color_ = [1.0, 1.0, 1.0, 1.0],
    size_ = 5.0
  ) {
    this.type = "point";
    this.position = position_;
    this.color = color_;
    this.size = size_;
  }

  render() {
    var xy = this.position;
    var size = this.size;
    var rgba = this.color;

    gl.disableVertexAttribArray(a_Position);

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

    gl.uniform1f(u_Size, size);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
