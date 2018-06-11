/**
 *
 * @method convertImageToCanvas
 * @method convertCanvasToImage
 */
export class Converter {
  public static convertImageToCanvas(image: number[][]): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image[0].length;
    canvas.height = image.length;

    const array = image.reduce(
      (arr, row) => [].concat(arr, row.reduce(
        (concatedRow, alpha) => [].concat(concatedRow, [0, 0, 0, (1 - alpha) * 255]), []))
    , []);

    const clampedArray =  new Uint8ClampedArray(array);
    const imageData = new ImageData(clampedArray, canvas.width, canvas.height);

    context.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Converts rgba array to grayscale image.
   * Alpha [0, 255] is mapped to [0, 1] range where 0 is full transparency.
   * @param  {HTMLCanvasElement} data serialised rgba values of an image
   * @return {number[]}      matrix representation of image's gray level.
   */
  public static convertCanvasToImage(canvas: HTMLCanvasElement): number[][] {
    const context = canvas.getContext('2d');
    const imageData: ImageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const image = [];

    for (let y = 0; y < imageData.height; y++) {
      image[y] = [];
      for (let x = 0; x < imageData.width; x++) {
        const offset = y * 4 * imageData.width + 4 * x;
        const alpha = imageData.data[offset + 3];
        // weird: when painting with stroke, alpha == 0 means white;
        // alpha > 0 is a grayscale value; in that case I simply take the R value
        if (alpha === 0) {
          imageData.data[offset] = 255;
          imageData.data[offset + 1] = 255;
          imageData.data[offset + 2] = 255;
        }
        imageData.data[offset + 3] = 255;
        // simply take red channel value. Not correct, but works for
        // black or white images.
        image[y][x] = imageData.data[y * 4 * imageData.width + x * 4 + 0] / 255;
      }
    }

    // console.log(image.map(row => row.join('')).join('\n'));
    return image;
  }

}
