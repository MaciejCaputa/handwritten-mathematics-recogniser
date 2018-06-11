import { BoundingBox } from './bounding-box';
import { Coordinate } from './coordinate';
import { Converter } from './converter';
import { Layer } from './layer';
import { Transformer } from './transformer';

/**
 * Segments an image based on 4 connectedness.
 * Preferably handles binary images but can work on non binary images too.
 * Returns
 * @param  {image[][]} image [description]
 * @return {Layer[]}         array of binary images each containing a single entity
 */
export class Segmenter {
  public static getLayers(image: number[][]): Layer[] {
    const rows = image.length;
    const columns = image[0].length;
    const layers: Layer[] = [];

    // Raster through an image row by row.
    // Image will be modifed after each run and the extracted pixel forming a lear will be removed form original image.
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        // If not labeled then it means that new layer will be created.
        if (image[y][x] === 0) {
          const layer = this.initialiseArray(columns, rows);
          layers.push(this.getLayer(x, y, image, layer));
        }
      }
    }

    // const layer = this.doThinning(layers[0].image);
    // console.log(layer);

    return layers
      .map((layer: Layer) => ({
        ...layer,
        image: this.doThinning(layer.image)
      }))
      .sort((layer1: Layer, layer2: Layer) => layer1.center.x - layer2.center.x);
  }

  private static getLayer(
    x: number,
    y: number,
    image: number[][],
    layer: number[][]
  ): Layer {

    layer = this.connect(x, y, image, layer);

    const center = Transformer.getCenter(layer);

    const boundingBox = Transformer.getBoundingBox(layer);
    const width = boundingBox.max.x - boundingBox.min.x + 1;
    const height = boundingBox.max.y - boundingBox.min.y + 1;
    const croppedImage = this.cropImage(layer, boundingBox);

    const size = 128;

    // Making the expression fit 32x32 image.
    const scale = size / Math.max(width, height);
    // console.log({ scale });

    const canvas = Converter.convertImageToCanvas(croppedImage);
    const context = canvas.getContext('2d');

    const canvasCopy = document.createElement('canvas');
    canvasCopy.width = size;
    canvasCopy.height = size;
    const copyCtx = canvasCopy.getContext('2d');

    // copyCtx.translate(-boundingBox.min.x, -boundingBox.min.y);

    // scale
    // copyCtx.translate(canvas.width / 2, canvas.height / 2);
    copyCtx.scale(scale, scale);
    // copyCtx.translate(-canvas.width / 2, -canvas.height / 2);

    copyCtx.drawImage(context.canvas, 0, 0);

    let transformed = Converter.convertCanvasToImage(canvasCopy);
    const boundingBox2 = Transformer.getBoundingBox(transformed);
    const center2 = Transformer.getCenter(transformed);

    // console.log({center2});

    copyCtx.clearRect(0, 0, 10000, 10000);

    if (width === Math.max(width, height)) {
      copyCtx.translate(
        0,
        (canvasCopy.height / 2 - center2.y) * (1 / scale)
      );
    } else {
      copyCtx.translate(
        (canvasCopy.width / 2 - center2.x) * (1 / scale),
        0
      );
    }

    copyCtx.drawImage(context.canvas, 0, 0);

    transformed = Converter.convertCanvasToImage(canvasCopy);

    transformed = Transformer.subsample(transformed, size, 32);

    // console.log(transformed);

    // const stage = this.cropImage(transformed, boundingBox2);

    // const canvasCopy2 = document.createElement('canvas');
    // canvasCopy2.width = 32;
    // canvasCopy2.height = 32;
    // const copyCtx2 = canvasCopy2.getContext('2d');
    //
    // const stageCenter = Transformer.getCenter(stage);
    // copyCtx2.translate(
    //   canvasCopy2.width / 2 - stageCenter.x,
    //   canvasCopy2.height / 2 - stageCenter.y
    // );
    // copyCtx2.drawImage(copyCtx.canvas, 0, 0);

    return {
      center,
      boundingBox,
      // boundingBox2,
      width,
      height,
      image: transformed
    };
  }

  // Labels pixels based on 4-connectedness.
  private static connect(
    x: number,
    y: number,
    image: number[][],
    layer: number[][]
  ): number[][] {
    const columns = image[0].length;
    const rows = image.length;

    // Remove the pixel form the original image.
    image[y][x] = 1;

    // Set the pixel on a separate layer.
    layer[y][x] = 0;

    if (y + 1 < rows && image[y + 1][x] === 0) {
      this.connect(x, y + 1, image, layer);
    }

    if (y - 1 >= 0 && image[y - 1][x] === 0) {
      this.connect(x, y - 1, image, layer);
    }

    if (x + 1 < columns && image[y][x + 1] === 0) {
      this.connect(x + 1, y, image, layer);
    }

    if (x - 1 >= 0 && image[y][x - 1] === 0) {
      this.connect(x - 1, y, image, layer);
    }

    // Returns an entity on a separate layer.
    return layer;
  }

  // Takes a layer with single entity and its bounding box and returns a cropped version of it.
  private static cropImage(layer: number[][], boundingBox: BoundingBox): number[][] {
    const columns = boundingBox.max.x - boundingBox.min.x + 1;
    const rows = boundingBox.max.y - boundingBox.min.y + 1;
    const image = this.initialiseArray(columns, rows);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
        image[y][x] = layer[boundingBox.min.y + y][boundingBox.min.x + x];
      }
    }
    return image;
  }

  private static initialiseArray(columns: number, rows: number): number[][] {
    const arr = Array.from(
      { length: rows },
      () => Array.from({ length: columns }, () => 1)
    );
    return arr;
  }

  private static doThinning(givenImage: number[][]): number[][] {
    // Cloning an image.
    const image = [];
    for (let y = 0; y  < givenImage.length; y++) {
      image[y] = [];
      for (let x = 0; x < givenImage[y].length; x++) {
        image[y][x] = 1 - givenImage[y][x];
      }
    }

    let a: number;
    let b: number;
    let pointsToChange = [];
    let hasChange: boolean;

    do {
        hasChange = false;

        for (let y = 1; y + 1 < image.length; y++) {
            for (let x = 1; x + 1 < image[y].length; x++) {
                a = this.getA(image, y, x);
                b = this.getB(image, y, x);
                if (
                  image[y][x] === 1 && 2 <= b && b <= 6 && a === 1
                  && (image[y - 1][x] * image[y][x + 1] * image[y + 1][x] === 0)
                  && (image[y][x + 1] * image[y + 1][x] * image[y][x - 1] === 0)
                ) {

                    pointsToChange.push({ x, y });
                    hasChange = true;
                }
            }
        }

        for (const point of pointsToChange) {
          image[point.y][point.x] = 0;
        }

        pointsToChange = [];

        for (let y = 1; y + 1 < image.length; y++) {
            for (let x = 1; x + 1 < image[y].length; x++) {
                a = this.getA(image, y, x);
                b = this.getB(image, y, x);
                if (
                  image[y][x] === 1 && 2 <= b && b <= 6 && a === 1
                  && (image[y - 1][x] * image[y][x + 1] * image[y][x - 1] === 0)
                  && (image[y - 1][x] * image[y + 1][x] * image[y][x - 1] === 0)
                ) {

                    pointsToChange.push({x, y});
                    hasChange = true;
                }
            }
        }

        for (const point of pointsToChange) {
          image[point.y][point.x] = 0;
        }

        pointsToChange = [];
    } while (hasChange);

    // Invert colors.
    for (let y = 0; y  < image.length; y++) {
      for (let x = 0; x < image[y].length; x++) {
        image[y][x] = 1 - image[y][x];
      }
    }

    return image;
  }

  private static getA(image: number[][], y: number, x: number) {
      let count = 0;

      // p2 p3
      if (
        y - 1 >= 0 && x + 1 < image[y].length &&
        image[y - 1][x] === 0 && image[y - 1][x + 1] === 1
      ) {
          count++;
      }

      // p3 p4
      if (
        y - 1 >= 0 && x + 1 < image[y].length &&
        image[y - 1][x + 1] === 0 && image[y][x + 1] === 1) {
          count++;
      }
      // p4 p5
      if (
        y + 1 < image.length && x + 1 < image[y].length &&
        image[y][x + 1] === 0 && image[y + 1][x + 1] === 1) {
          count++;
      }

      // p5 p6
      if (
        y + 1 < image.length && x + 1 < image[y].length &&
        image[y + 1][x + 1] == 0 && image[y + 1][x] === 1
      ) {
          count++;
      }

      // p6 p7
      if (
        y + 1 < image.length && x - 1 >= 0 &&
        image[y + 1][x] === 0 && image[y + 1][x - 1] == 1
      ) {
          count++;
      }

      // p7 p8
      if (
        y + 1 < image.length && x - 1 >= 0 &&
        image[y + 1][x - 1] === 0 && image[y][x - 1] == 1
      ) {
          count++;
      }

      //p8 p9
      if (
        y - 1 >= 0 && x - 1 >= 0 &&
        image[y][x - 1] === 0 && image[y - 1][x - 1] == 1
      ) {
          count++;
      }

      // p9 p2
      if (
        y - 1 >= 0 && x - 1 >= 0 &&
        image[y - 1][x - 1] === 0 &&image[y - 1][x] == 1
      ) {
          count++;
      }

      return count;
  }

  private static getB(image: number[][], y: number, x: number): number {
    return image[y - 1][x] + image[y - 1][x + 1] + image[y][x + 1]
          + image[y + 1][x + 1] + image[y + 1][x] + image[y + 1][x - 1]
          + image[y][x - 1] + image[y - 1][x - 1];
  }

}
