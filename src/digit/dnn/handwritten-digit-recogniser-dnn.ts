import { HandwrittenDigitTransformer } from '../common/handwritten-digit-transformer';
import { b2, b3, w12, w23 } from './model';
import { Recognition } from '../../utility/recognition';

export class HandwrittenDigitRecogniserDNN {

  public static recognise(canvas: HTMLCanvasElement): number {
    // Serialised image
    const image: number[] = HandwrittenDigitTransformer.transform(canvas);
    // Each item in this array represents likelyhood of a given number being written.
    const recognitions: number[] = this.feedForward(image);

    // console.log(`recognitions = ${this.formatRecognitions(recognitions).map((recognition: Recognition) =>
    //     `(${recognition.recognition}: ${recognition.probability})`).join(', ')}`);

    return recognitions.indexOf(Math.max(...recognitions));
  }

  public static recogniseWithMetadata(canvas: HTMLCanvasElement): Recognition[] {
    // Serialised image
    const image: number[] = HandwrittenDigitTransformer.transform(canvas);
    // Each item in this array represents likelyhood of a given number being written.
    const recognitions: Recognition[] = this.formatRecognitions(this.feedForward(image));

    // console.log(`recognitions = ${recognitions.map((recognition: Recognition) =>
    //     `(${recognition.recognition}: ${recognition.probability})`).join(', ')}`);

    return recognitions;
  }

  private static treshold = 1.5;

  private static formatRecognitions(recognitions: number[]): Recognition[] {
    return recognitions
      .map((probability) => Math.round(probability * 100) / 100)
      .map((probability, recognition) => ({ probability, recognition }))
  }

  /**
   * @param  {number[]} image takes serialised image as input
   * @return {number[]}
   */
  private static feedForward(image: number[]): number[] {
    // Compute activation of the 2nd layer.
    const activation2 = [];
    for (let i = 0; i < w12.length; i++) {
      // Initialise i-th neuron with i-th bias.
      activation2[i] = b2[i];
      for (let j = 0; j < w12[i].length; j++) {
        activation2[i] += image[j] * w12[i][j];
      }
      // Softmax the value using sigmoid function.
      activation2[i] = 1 / (1 + Math.exp(-activation2[i]));
    }

    // Compute activation of the 3rd layer.
    const activation3 = [];
    for (let i = 0; i < w23.length; i++) {
      // Initialise i-th neuron with i-th bias.
      activation3[i] = b3[i];
      for (let j = 0; j < w23[i].length; j++) {
        activation3[i] += activation2[j] * w23[i][j];
      }
    }

    // Mapping the activations to be values between 0 and 1.
    // Take max value of the 3rd layer.
    const maxProbability = Math.max(...activation3);

    // Compute softmaxed probabilities using max probability and sigmoid.
    const normalisedProbabilities: number[] = activation3.map(
      (probability: number) => Math.exp(probability - maxProbability)
    );

    const totalProbability: number = normalisedProbabilities.reduce(
      (partialProbability: number, probability: number) => partialProbability + probability
    );

    const recognitions: number[] = normalisedProbabilities.map(
      (probability: number) => probability / totalProbability
    );

    return recognitions;
  }

}
