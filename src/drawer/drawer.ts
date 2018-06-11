import { Mouse } from './mouse';

export class Drawer {
  public feedbackCanvas: HTMLCanvasElement;
  private feedbackContext: CanvasRenderingContext2D;

  private mouse: Mouse;

  constructor(
    selector: string | HTMLCanvasElement,
    width?: number,
    height?: number
  ) {
    if (typeof selector === 'string') {
      const elements = document.querySelectorAll(selector);

      if (!document) {
        throw new Error('No DOM found.');
      }

      if (elements.length === 0) {
        throw new Error(`No HTMLElement found with selector ${selector}.`);
      } else if (elements.length > 1) {
        throw new Error('Selector must explicitly identify a single canvas.');
      }

      // Get feedback canvas and context.
      this.feedbackCanvas = elements[0] as HTMLCanvasElement;
      this.feedbackContext = this.feedbackCanvas.getContext('2d');
    } else {
      // Get feedback canvas and context.
      this.feedbackCanvas = selector;
      this.feedbackContext = this.feedbackCanvas.getContext('2d');
    }

    // Set external canvas parameters.
    if (width) {
      this.feedbackCanvas.width = width;
    }

    if (height) {
      this.feedbackCanvas.height = height;
    }

    // Set canvas cursor.
    this.feedbackCanvas.style.cursor = 'crosshair';

    // create a mouse object
    this.mouse = new Mouse();

    this.addListeners();

    // Set internal parameters for feedback context.
    this.feedbackContext.globalCompositeOperation = 'source-over';
    this.feedbackContext.globalAlpha = 1;
    this.feedbackContext.strokeStyle = 'rgba(0,0,0,1)';
    this.feedbackContext.lineCap = 'round';
    this.feedbackContext.lineJoin = 'round';
    // this.feedbackContext.translate(0.5, 0.5);
    // TODO: Set the line width depending on the width and height of the canvas.
    // this.feedbackContext.lineWidth = 8;
    this.feedbackContext.lineWidth = 4;

  }

  public clear() {
    const width = this.feedbackCanvas.width;
    const height = this.feedbackCanvas.height;

    // Clear feedback canvas.
    this.feedbackContext.clearRect(-10, -10, width + 20, height + 20);
  }

  // mousedown handler
  private mouseDown(mousePosition) {
    mousePosition.preventDefault();
    // update position just in case
    this.mouseMove(mousePosition);

    // remember it
    this.mouse.px = this.mouse.x;
    this.mouse.py = this.mouse.y;

    // begin drawing
    this.mouse.down = true;

    // Begin drawing on feedback context.
    this.feedbackContext.beginPath();
    this.feedbackContext.moveTo(this.mouse.px, this.mouse.py);
  }

  // mousemove handler
  private mouseMove(e) {
    e.preventDefault();

     // Get position relative to the viewport.
    const rect: ClientRect = this.feedbackCanvas.getBoundingClientRect();

    // Get position relative to the
    const position = e.changedTouches && e.changedTouches[0] || e;
    let x = position.offsetX;
    let y = position.offsetY;

    if (typeof x === 'undefined') {
      x = position.clientX // Horizontal coordinate of the mouse pointer
        + document.documentElement.scrollLeft
        // Distance between left edge of the html element and left the edge of the canvas.
        - rect.left;
    }

    if (typeof y === 'undefined') {
      y = position.clientY
        + document.documentElement.scrollTop
        // Distance between top edge of the html element and top edge of the canvas.
        - rect.top;
    }

    // Check if drawing.
    if (this.mouse.down) {
      // Draw if mouse is down.
      this.draw(x, y);
    } else {
      // Otherwise pudate mouse position.
      this.mouse.x = x;
      this.mouse.y = y;
    }
  }

  private mouseUp() {
    this.mouse.down = false;

    // Stop drawing.
    this.feedbackContext.closePath();
  }

  private lineDistance(x1, y1, x2, y2) {
    // calculate euclidean distance between (x1, y1) and (x2, y2)
    const xs = Math.pow(x2 - x1, 2);
    const ys = Math.pow(y2 - y1, 2);
    return Math.sqrt(xs + ys);
  }

  private draw(mX, mY) {
    const mouse = this.mouse;

    // calculate distance from previous point
    const rawDist = this.lineDistance(mX, mY, mouse.px, mouse.py);

    // now, here we scale the initial smoothing factor by the raw distance
    // this means that when the mouse moves fast, there is more smoothing
    // and when we're drawing small detailed stuff, we have more control
    // also we hard clip at 1
    const smoothingFactor = Math.min(0.87, 0.85 + (rawDist - 60) / 3000);

    // calculate smoothed coordinates
    mouse.x = mX - (mX - mouse.px) * smoothingFactor;
    mouse.y = mY - (mY - mouse.py) * smoothingFactor;

    // recalculate distance from previous point, this time relative to the smoothed coords
    // const dist = this.lineDistance(mouse.x, mouse.y, mouse.px, mouse.py);

    // draw using quad interpolation
    this.feedbackContext.quadraticCurveTo(mouse.px, mouse.py, mouse.x, mouse.y);
    this.feedbackContext.stroke();

    // remember
    mouse.px = mouse.x;
    mouse.py = mouse.y;
  }

  // Attach listeners which support both mouse and touch device.
  private addListeners() {
    // Pass touch events to canvas element on mobile IE11 and Edge.
    this.feedbackCanvas.style.msTouchAction = 'none';
    this.feedbackCanvas.style.touchAction = 'none';

    // Start drawing.
    this.feedbackCanvas.addEventListener('mousedown', this.mouseDown.bind(this));
    this.feedbackCanvas.addEventListener('touchstart', this.mouseDown.bind(this));

    // Continue drawing.
    this.feedbackCanvas.addEventListener('mousemove', this.mouseMove.bind(this));
    this.feedbackCanvas.addEventListener('touchmove', this.mouseMove.bind(this));

    // Stop drawing by closing the path.
    document.addEventListener('mouseup', this.mouseUp.bind(this));
    this.feedbackCanvas.addEventListener('touchend', this.mouseUp.bind(this));
  }

  // Remove all event listeners.
  private removeListeners() {
    // Clear canvas.
    this.clear();

    // Start drawing.
    this.feedbackCanvas.addEventListener('mousedown', this.mouseDown.bind(this));
    this.feedbackCanvas.addEventListener('touchstart', this.mouseDown.bind(this));

    // Continue drawing.
    this.feedbackCanvas.addEventListener('mousemove', this.mouseMove.bind(this));
    this.feedbackCanvas.addEventListener('touchmove', this.mouseMove.bind(this));

    // Stop drawing.
    document.addEventListener('mouseup', this.mouseUp.bind(this));
    this.feedbackCanvas.addEventListener('touchend', this.mouseUp.bind(this));
  }

}
