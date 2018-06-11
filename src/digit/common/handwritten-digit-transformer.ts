import { BoundingBox } from '../../utility/bounding-box';
import { Converter } from '../../utility/converter';
import { Coordinate } from '../../utility/coordinate';
import { Transformer } from '../../utility/transformer';

/**
 * Transforms a canvas data into 28x28 pixels.
 * 1. Convert rgba serialised image into grayscale matrix.
 * 2. Segment an image to find a portion of the image that has a digit.
 * 3. Scale the image so that a digit fits 28x28 pixel window.
 */
export class HandwrittenDigitTransformer {

  /**
   * [transform description]
   * @param  {HTMLCanvasElement} canvas [description]
   * @return {number[]}                 [description]
   */
  public static transform(canvas: HTMLCanvasElement): number[] {
    const context = canvas.getContext('2d');
    // console.log('transform:', canvas);
    const image: number[][] = Converter.convertCanvasToImage(canvas);
    // console.log({ image });
    const boundingBox: BoundingBox = Transformer.getBoundingBox(image);
    // console.log({ boundingBox });
    const translate: Coordinate = this.translate(image);
    // console.log(`translate = [${translate.x}, ${translate.y}]`);


    // 280 canvas size and 200 inner box translatex to 28x28 and 20x20 when subsampling
    const canvasCopy = document.createElement('canvas');

    canvasCopy.width = 280; // canvas.width;
    canvasCopy.height = 280; // canvas.height;

    canvasCopy.className = 'canvas';
    const copyCtx = canvasCopy.getContext('2d');
    // document.querySelector('.flex').appendChild(canvasCopy);

    const dx = boundingBox.max.x - boundingBox.min.x + 1;
    const dy = boundingBox.max.y - boundingBox.min.y + 1;
    const scale = 200 / Math.max(dx, dy);

    // scale
    // copyCtx.translate(canvas.width / 2, canvas.height / 2);
    // copyCtx.scale(scale, scale);
    // copyCtx.translate(-canvas.width / 2, -canvas.height / 2);

    copyCtx.translate(280 / 2, 280 / 2);
    copyCtx.scale(scale, scale);
    copyCtx.translate(-canvas.width / 2, -canvas.height / 2);

    // translate to center of mass
    copyCtx.translate(translate.x, translate.y);

    copyCtx.drawImage(context.canvas, 0, 0);

    // document.body.appendChild(canvasCopy);

    const transformed: number[][] = Converter.convertCanvasToImage(canvasCopy);
    // console.log({ transformed });

    const serialized: number[] = Transformer.serializeImage(transformed);
    // console.log({ serialized });

    return serialized;
  }

  /**
   * Coordinantes of image's centroid
   * Evaluates center of mass of digit, in order to center it.
   * Note that 1 stands for black and 0 for white so it has to be inverted.
   */
  private static translate(image: number[][]): Coordinate {
    const rows = image.length;
    const columns = image[0].length;

    // Get center coordinate.
    const center: Coordinate = Transformer.getCenter(image);

    // Translation vectors that arranges
    const x = Math.round(columns / 2 - center.x);
    const y = Math.round(rows / 2 - center.y);

    return { x, y };
  }
}
