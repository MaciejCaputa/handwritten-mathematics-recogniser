import {
  HandwrittenDigitRecogniser,
  HandwrittenExpressionRecogniser,
  Drawer,
  Segmenter,
  Transformer,
  Converter,
} from '../index';

(() => {
  // Define a scope for DOM access.
  const scope = '.handwritten-digit-recogniser';

  // Get the canvas.
  const canvas: HTMLCanvasElement = document.querySelector(`${scope} .input`) as HTMLCanvasElement;

  // Bind a drawer to it to allow drawing on the canvas.
  const drawer = new Drawer(canvas);

  // Get buttons.
  const recogniseButton = document.querySelector(`${scope} .recognise`) as HTMLButtonElement;
  const clearButton = document.querySelector(`${scope} .clear`) as HTMLButtonElement;

  const digit: HTMLElement = document.querySelector(`${scope} .digit`) as HTMLElement;

  recogniseButton.addEventListener('click', () => {
    const recognition = HandwrittenDigitRecogniser.recognise(canvas);
    digit.innerHTML = recognition.toString();
  });

  clearButton.addEventListener('click', () => {
    digit.innerHTML = '';
    drawer.clear();
  });
})();

(() => {
  // Define a scope for DOM access.
  const scope = '.handwritten-expression-recogniser';

  // Get the canvas.
  const canvas: HTMLCanvasElement = document.querySelector(`${scope} .input`) as HTMLCanvasElement;

  // Bind a drawer to it to allow drawing on the canvas.
  const drawer = new Drawer(canvas);

  // Get buttons.
  const recogniseButton = document.querySelector(`${scope} .recognise`) as HTMLButtonElement;
  const clearButton = document.querySelector(`${scope} .clear`) as HTMLButtonElement;

  const segmentation = document.querySelector(`${scope} .segmentation`);
  const expression = document.querySelector(`${scope} .expression`) as HTMLTextAreaElement;
  const latex = document.querySelector(`${scope} .latex`);

  recogniseButton.addEventListener('click', () => {

    // const image = Converter.convertCanvasToImage(canvas);

    // const layers = Segmenter.getLayers(image);

    // segmentation.innerHTML = '';

    // layers
    //   .map((layer) => Converter.convertImageToCanvas(layer.image))
    //   .map((canvas: HTMLCanvasElement) => segmentation.appendChild(canvas));

    const recognition = HandwrittenExpressionRecogniser.recognise(canvas);

    expression.value = recognition;
    latex.innerHTML = `$$${recognition}$$`;

    // Render latex on the screen.
    eval('MathJax.Hub.Queue(["Typeset",MathJax.Hub]);');
  });

  clearButton.addEventListener('click', () => {
    drawer.clear();
    expression.value = '';
    latex.innerHTML = '';
  });
})();
