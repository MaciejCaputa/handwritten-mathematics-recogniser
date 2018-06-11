import { BoundingBox } from './bounding-box';
import { Coordinate } from './coordinate';

/**
 * @method serializeImage
 * @method getBoundingBox
 */
export class Transformer {
  public static serializeImage(image: number[][]): number[] {
    const serializedImage = new Array(784);
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        let mean = 0;
        for (let v = 0; v < 10; v++) {
          for (let h = 0; h < 10; h++) {
            mean += image[y * 10 + v][x * 10 + h];
          }
        }
        mean = (1 - mean / 100); // average and invert
        serializedImage[x * 28 + y] = (mean - 0.5) / 0.5;
        // serializedImage[x * 28 + y] = image[y][x];
      }
    }
    return serializedImage;
  }

  // Maps a square to a smaller square.
  public static subsample(image: number[][], source = 64, target = 32): number[][] {
    const columns = image[0].length;
    const rows = image.length;

    const array = Array.from(
      { length: target },
      () => Array.from({ length: target }, () => 1)
    );

    // Must be an integer
    const ratio = source / target;

    for (let y = 0; y < target; y++) {
      for (let x = 0; x < target; x++) {
        let sum = 0;
        for (let v = 0; v < ratio; v++) {
          for (let h = 0; h < ratio; h++) {
            sum += image[y * ratio + v][x * ratio + h];
          }
        }
        const mean = sum / (ratio * ratio);
        array[y][x] = Math.round(mean);
        // array[y][x] = mean;
        // array[y][x] = (mean - 0.5) / 0.5;
        // serializedImage[x * 28 + y] = image[y][x];
      }
    }
    return array;
  }

  /**
   * Segmentation is performed by tresholding a grayscale image.
   * @param  {number[][]} image grayscale image
   * @return {Segmentation}     description of are where a digit is drawn.
   */
  public static getBoundingBox(layer: number[][], treshold = 0.01): BoundingBox {
    const rows = layer.length;
    const columns = layer[0].length;

    let minX = columns;
    let minY = rows;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        if (layer[y][x] < treshold) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    return {
      min: {
        x: minX,
        y: minY
      },
      max: {
        x: maxX,
        y: maxY
      }
    };
  }

  public static flattenImage(image: number[][]): number[] {
    return [].concat.apply([], image);
  }

  public static getCenter(image: number[][]): Coordinate {
    const rows = image.length;
    const columns = image[0].length;

    let meanX = 0;
    let meanY = 0;
    let totalIntensities = 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const intensity = (1 - image[y][x]);
        totalIntensities += intensity;
        meanX += x * intensity;
        meanY += y * intensity;
      }
    }

    // Coordinantes of a center of mass of the image.
    const centerX = meanX / totalIntensities;
    const centerY = meanY / totalIntensities;

    return {
      x: centerX,
      y: centerY
    };
  }

  public static invertColors(givenImage: number[][]) {
    // Cloning an image.
    const image = [];
    for (let y = 0; y  < givenImage.length; y++) {
      image[y] = [];
      for (let x = 0; x < givenImage[y].length; x++) {
        image[y][x] = 1 - givenImage[y][x];
      }
    }
    return image;
  }
}
