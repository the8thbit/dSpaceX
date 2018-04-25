/**
 * Creates a basic quad with 4 vertices and 6 indices.
 */
export class Quad {
  /**
   * Quad constructor.
   * @param {number} centerX
   * @param {number} centerY
   * @param {number} width
   * @param {number} height
   * @param {number} firstIndex
   */
  constructor(centerX, centerY, width, height) {
    this.X = centerX; // center of quad
    this.Y = centerY;
    this.width = width;
    this.height = height;

    let minX = -(width / 2.0) + centerX;
    let maxX = minX + width;
    let minY = -(height / 2.0) + centerY;
    let maxY = minY + height;

    // using vec3 as (x, y, UV)
    this.vertices = [
      minX, maxY, 0,
      maxX, maxY, 1,
      minX, minY, 2,
      minX, minY, 2,
      maxX, maxY, 1,
      maxX, minY, 3];
  }
}

/**
 * Creates a basic edge from 2 points
 */
export class Edge {
  /**
   * Edge constructor
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} lineWidth
   */
  constructor(x1, y1, x2, y2, lineWidth = 0.01) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    // Setup properties for drawing as quad
    let width = lineWidth / 2;
    let vectorX = x2 - x1;
    let vectorY = y2 - y1;
    let lineVector = [vectorX, vectorY];
    let offsetVector = [lineVector[1], -lineVector[0]];

    // Normalize the offset vector
    let mag = Math.abs(Math.sqrt((offsetVector[0] * offsetVector[0])
      + (offsetVector[1] * offsetVector[1])));
    offsetVector = [offsetVector[0]/mag, offsetVector[1]/mag];

    let p1 = [x1 + offsetVector[0] * width, y1 + offsetVector[1] * width];
    let p2 = [x1 - offsetVector[0] * width, y1 - offsetVector[1] * width];
    let p3 = [x2 + offsetVector[0] * width, y2 + offsetVector[1] * width];
    let p4 = [x2 - offsetVector[0] * width, y2 - offsetVector[1] * width];

    // using vec3 as (x, y, UV)
    this.vertices = [
      p1[0], p1[1], 0,
      p2[0], p2[1], 1,
      p3[0], p3[1], 2,
      p3[0], p3[1], 2,
      p2[0], p2[1], 1,
      p4[0], p4[1], 3];
  }
}

