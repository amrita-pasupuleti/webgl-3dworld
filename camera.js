class Camera {
  constructor(canvas) {
    this.fov = 60;

    this.eye = new Vector3([3, 0.5, 5]);
    this.at = new Vector3([0, 0.5, 0]);

    this.up = new Vector3([0, 1, 0]);

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();

    this.updateView();
    this.updateProjection(canvas);
  }

  updateView() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0],
      this.eye.elements[1],
      this.eye.elements[2],
      this.at.elements[0],
      this.at.elements[1],
      this.at.elements[2],
      this.up.elements[0],
      this.up.elements[1],
      this.up.elements[2]
    );
  }

  updateProjection(canvas) {
    this.projectionMatrix.setPerspective(
      this.fov,
      canvas.width / canvas.height,
      0.1,
      1000
    );
  }

  moveForward(speed = 0.2) {
    let f = new Vector3([
      this.at.elements[0] - this.eye.elements[0],
      this.at.elements[1] - this.eye.elements[1],
      this.at.elements[2] - this.eye.elements[2],
    ]);
    f.elements[1] = 0;
    f.normalize();

    this.eye.elements[0] += f.elements[0] * speed;
    this.eye.elements[1] += f.elements[1] * speed;
    this.eye.elements[2] += f.elements[2] * speed;

    this.at.elements[0] += f.elements[0] * speed;
    this.at.elements[1] += f.elements[1] * speed;
    this.at.elements[2] += f.elements[2] * speed;

    this.updateView();
  }

  moveBackward(speed = 0.2) {
    let f = new Vector3([
      this.at.elements[0] - this.eye.elements[0],
      this.at.elements[1] - this.eye.elements[1],
      this.at.elements[2] - this.eye.elements[2],
    ]);
    f.elements[1] = 0;
    f.normalize();

    this.eye.elements[0] -= f.elements[0] * speed;
    this.eye.elements[1] -= f.elements[1] * speed;
    this.eye.elements[2] -= f.elements[2] * speed;

    this.at.elements[0] -= f.elements[0] * speed;
    this.at.elements[1] -= f.elements[1] * speed;
    this.at.elements[2] -= f.elements[2] * speed;

    this.updateView();
  }

  moveLeft(speed = 0.2) {
    let f = new Vector3([
      this.at.elements[0] - this.eye.elements[0],
      this.at.elements[1] - this.eye.elements[1],
      this.at.elements[2] - this.eye.elements[2],
    ]);
    f.normalize();

    let s = new Vector3([
      this.up.elements[1] * f.elements[2] - this.up.elements[2] * f.elements[1],
      this.up.elements[2] * f.elements[0] - this.up.elements[0] * f.elements[2],
      this.up.elements[0] * f.elements[1] - this.up.elements[1] * f.elements[0],
    ]);
    s.normalize();

    this.eye.elements[0] -= s.elements[0] * speed;
    this.eye.elements[1] -= s.elements[1] * speed;
    this.eye.elements[2] -= s.elements[2] * speed;

    this.at.elements[0] -= s.elements[0] * speed;
    this.at.elements[1] -= s.elements[1] * speed;
    this.at.elements[2] -= s.elements[2] * speed;

    this.updateView();
  }

  moveRight(speed = 0.2) {
    let f = new Vector3([
      this.at.elements[0] - this.eye.elements[0],
      this.at.elements[1] - this.eye.elements[1],
      this.at.elements[2] - this.eye.elements[2],
    ]);
    f.normalize();

    let s = new Vector3([
      this.up.elements[1] * f.elements[2] - this.up.elements[2] * f.elements[1],
      this.up.elements[2] * f.elements[0] - this.up.elements[0] * f.elements[2],
      this.up.elements[0] * f.elements[1] - this.up.elements[1] * f.elements[0],
    ]);
    s.normalize();

    this.eye.elements[0] += s.elements[0] * speed;
    this.eye.elements[1] += s.elements[1] * speed;
    this.eye.elements[2] += s.elements[2] * speed;

    this.at.elements[0] += s.elements[0] * speed;
    this.at.elements[1] += s.elements[1] * speed;
    this.at.elements[2] += s.elements[2] * speed;

    this.updateView();
  }

  panLeft(alpha = 5) {
    let f = new Vector3([
      this.at.elements[0] - this.eye.elements[0],
      this.at.elements[1] - this.eye.elements[1],
      this.at.elements[2] - this.eye.elements[2],
    ]);

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(
      alpha,
      this.up.elements[0],
      this.up.elements[1],
      this.up.elements[2]
    );

    // Apply rotation manually to Vector3 using homogeneous coords
    let f4 = new Vector4([f.elements[0], f.elements[1], f.elements[2], 0.0]);
    let rotatedF4 = rotationMatrix.multiplyVector4(f4);

    // New f vector: rotated
    let f_prime = new Vector3([
      rotatedF4.elements[0],
      rotatedF4.elements[1],
      rotatedF4.elements[2],
    ]);

    this.at = new Vector3([
      this.eye.elements[0] + f_prime.elements[0],
      this.eye.elements[1] + f_prime.elements[1],
      this.eye.elements[2] + f_prime.elements[2],
    ]);

    this.updateView();
  }

  panRight(alpha = 5) {
    this.panLeft(-alpha);
  }
}
