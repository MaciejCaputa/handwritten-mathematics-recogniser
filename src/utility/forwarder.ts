/**
 * This class implements forwarding funcitonality for deep/convolutional neural networks.
 */
export class Forwarder {
  /**
   * Returns value between (0, +infty)
   * @param  {number} value real number
   * @return {number}       non-negative real number
   */
  public static relu(value: number): number {
    return Math.max(value, 0);
  }

  public static matrixAddition(matrix1: number[][], matrix2: number[][]): number[][] {
    // TODO: Check thta matrces are of the same size.
    return;
  }

  public static matrixMultiplication(matrix1: number[][], matrix2: number[][]): number[][] {
    /**
     * The number of columns in the first matrix must match
     * the number of rows in the second matrix.
     */
    if (matrix1.length !== matrix2[0].length) {
      throw new Error('Illegal matrix dimensions!');
    }

    // Initialise matrix with appropriate size and 0 as values.
    const matrix = Array.from(
      { length: matrix1[0].length},
      () => Array.from(
        { length: matrix2.length},
        () => 0
      )
    );

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[0].length; x++) {
        for (let z = 0; z < matrix[0].length; z++) {
          matrix[y][x] += matrix1[y][z] * matrix2[z][x];
        }
      }
    }

    return matrix;
  }

  public static convolution(image: number[][], kernel: number[][], padding = false) {
    // TODO: Determine size of a convoluted image.
    // TODO: Create placholder array for convolluted image.
    // TODO: Convolute the image.

    const convolution = Array.from(
      { length: image.length},
      () => Array.from(
        { length: image[0].length},
        () => 0
      )
    );

    for (let y = 0; y < image.length; y++) {
      for (let x = 0; x < image[y].length; x++) {
        for (let j = 0; j < kernel.length; j++) {
          for (let i = 0; i < kernel[j].length; i++) {
            convolution[y][x] += image[y + j][x + i] * kernel[y + j][x + i];
          }
        }
      }
    }
    return convolution;
  }

  public static maxPooling(image: number[][], windowX: number, windowY: number, strideX: number, strideY: number) {
    return;
  }

  public static softmax(value: number): number {
    return;
  }

  public static softmaxProbabilities(probabilities: number[]): number[] {
    return;
  }
}
