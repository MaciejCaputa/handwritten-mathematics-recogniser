import { b1, b2, w1, w2 } from './model';
import { Recognition } from '../../utility/recognition';
import { Layer } from '../../utility/layer';
import { Transformer } from '../../utility/transformer';
import { Segmenter } from '../../utility/segmenter';
import { Converter } from '../../utility/converter';

const classes = [
  '(',
  ')',
  '+',
  '-',
  '.',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '\\sqrt',
  '\\times',
];

export class HandwrittenExpressionRecogniserDNN {
  public static recognise(canvas: HTMLCanvasElement): string {
    const timeStart = +new Date();
    const image: number[][] = Converter.convertCanvasToImage(canvas);
    const layers: Layer[] = Segmenter.getLayers(image)
      .map((layer: Layer) => {
        const recognitions = this.feedForward(Transformer.flattenImage(layer.image));
        const best = recognitions.indexOf(Math.max(...recognitions));
        const recognition = classes[best];
        return {
          ...layer,
          recognition,
        };
      })
      // Modify the layers.
      .map((layer: Layer) => {
        // Recognise a dot.
        if (layer.width < 25 && layer.height < 25) {
          layer.recognition = '.';
        }
        return layer;
      });

    const latex = this.format(layers);

    // Debug consol log.
    console.debug([
      new Date().toString(),
      `took ${+new Date() - timeStart}ms to recognise`,
      latex
    ].join('\n'))

    return latex;
  }

  private static feedForward(image: number[]): number[] {

    // Capture time at the begining for the performance measurment.
    const start = +new Date();

    // Compute activation of the 2nd layer.
    const activation2 = [];
    for (let i = 0; i < w1[0].length; i++) {
      // Initialise i-th neuron with i-th bias.
      activation2[i] = b1[i];
      for (let j = 0; j < w1.length; j++) {
        activation2[i] += image[j] * w1[j][i];
      }

      activation2[i] = Math.max(activation2[i], 0);
    }

    // Compute activation of the 3rd layer.
    const activation3 = [];
    for (let i = 0; i < w2[0].length; i++) {
      // Initialise i-th neuron with i-th bias.
      activation3[i] = b2[i];
      for (let j = 0; j < w2.length; j++) {
        activation3[i] += activation2[j] * w2[j][i];
      }
    }


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

  // // Labels each layer with a level so the look up in the fomat function.
  // private static traverse(layers: Layer[]): Layer[] {
  //   const level = 0;
  //
  //   return layers.map()
  // }

  private static format(layers: Layer[], level = 0): string {
    if (layers.length === 0) {
      return '';
    }

    if (layers.length === 1) {
      // Appending last parameter and making sure brackets are closed.
      return layers[0].recognition + '}'.repeat(Math.abs(level));
    }

    // Now it is safe to assume that there at least to layers.
    const [layer1, layer2, layer3] = layers;

    console.log(layer1, layer2, layer3);

    // Handle division sign.
    if (
      layers.length >= 3 &&
      layer1.recognition === '.' &&
      layer2.recognition === '-' &&
      layer3.recognition === '.'
    ) {
      return `\\div ${this.format(layers.slice(3), level)}`;
    }

    // Handle equal sign.
    if (
      layer1.recognition === '-' &&
      layer2.recognition === '-'
    ) {
      return `= ${this.format(layers.slice(2), level)}`;
    }

    // If it is a fraction.
    if (layers.some((layer: Layer) => layer.recognition === '-')) {
      const indexOfBar = layers.map((layer: Layer) => layer.recognition).indexOf('-');
      const bar = layers[indexOfBar];
      let index = 0;

      for (let i = 0; i < layers.length; i++) {
        // If the symbols is not above or below the bar then it cannot be in a fraction.
        if (
          i !== indexOfBar &&
          layers[i].boundingBox.max.y > bar.center.y &&
          layers[i].boundingBox.min.y < bar.center.y
        ) {
          break;
        } else {
          index  =  i;
        }
      }

      if (index >= 2) {
        const numeratorLayers = layers.slice(0, index + 1)
          .filter((layer: Layer) => layer.recognition !== '-')
          .filter((layer: Layer) => layer.boundingBox.max.y < bar.center.y);

        const denominatorLayers = layers.slice(0, index + 1)
          .filter((layer: Layer) => layer.recognition !== '-')
          .filter((layer: Layer) => layer.boundingBox.min.y > bar.center.y);

        const remainingLayers = layers.slice(index + 1);

        if (numeratorLayers.length > 0 && denominatorLayers.length > 0) {
          return `\\frac{${this.format(numeratorLayers, level)}}{${this.format(denominatorLayers, level)}} ${this.format(remainingLayers, level)}`;
        }
      }
    }

    // Check if level goes up.
    if (this.isSuperscript(layer1, layer2, level)) {
      return this.formatSuperscript(layer1, layers, level);
    }

    // Check if level goes down.
    if (this.isSubscript(layer1, layer2, level)) {
      return this.formatSubscript(layer1, layers, level);
    }

    // Otherwise it is on the same level.
    return this.formatSameLevel(layer1, layers, level);
  }

  private static isSuperscript(layer1: Layer, layer2: Layer, level: number): boolean {
    if (
      this.isOperation(layer1.recognition.toString()) ||
      level >= 0 && this.isOperation(layer2.recognition.toString())
    ) {
      return false;
    }

    return layer1.center.y > layer2.boundingBox.max.y;
  }

  private static formatSuperscript(layer: Layer, layers: Layer[], level: number): string {
    level++;
    if (level > 0) {
      return `${layer.recognition}^{${this.format(layers.slice(1), level)}`;
    } else {
      return `${layer.recognition}}${this.format(layers.slice(1), level)}`;
    }
  }

  private static isSubscript(layer1: Layer, layer2: Layer, level: number): boolean {
    // Level cannot be change when a symbol in an operation.
    if (
      this.isOperation(layer1.recognition.toString()) ||
      level <= 0 && this.isOperation(layer2.recognition.toString())
    ) {
      return false;
    }

    return layer1.center.y < layer2.boundingBox.min.y;
  }

  private static formatSubscript(layer: Layer, layers: Layer[], level: number): string {
    level--;
    if (level < 0) {
      return `${layer.recognition}_{${this.format(layers.slice(1), level)}`;
    } else {
      // Otherwise, closing the bracket.
      return `${layer.recognition}}${this.format(layers.slice(1), level)}`;
    }
  }

  // private static isFraction(layer: Layer, layers: Layer[], level: number): string {
  //
  // }

  // private static formatFraction(layer: Layer, layers: Layer[], level: number): string {
  //   return `${layer.recognition}_{${this.format(layers.slice(1), level)}`;
  // }

  // private static isSameLevel(layer1: Layer, layer2: Layer): boolean {
  //   return Math.abs(layer1.center.y - layer2.center.y) < 0.2 * (layer.height + layer2.height) / 2
  // }

  private static formatSameLevel(layer: Layer, layers: Layer[], level: number) {
    return `${layer.recognition}${this.format(layers.slice(1), level)}`;
  }

  private static isOperation(symbol: string): boolean {
    return ['+', '-', '\\times', '\\div', '\\sqrt', '=', '.'].indexOf(symbol) > -1;
  }
}
