export class Feature {
  constructor(name, filename, r = 255, g = 255, b = 255) {
    this.name = name;
    this.r = r;
    this.g = g;
    this.b = b;
    this.filename = filename;
  }
}