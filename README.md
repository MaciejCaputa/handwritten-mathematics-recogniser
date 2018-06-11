# Handwritten Mathematics Recognisers
*Easy and abstracted way to recognise handwritten mathematics in a browser or in a web view.*

The codebase consists of Python and TensorFlow scripts producing trained models used by the recognisers implemented in TypeScript to recognise a digit or an expression handwritten on an HTML canvas. Optionally, the package provides a functionality for a user to handwrite mathematics on a HTML canvas.

*If you wish to contribute or run the development mode see Contribution and Development sections respectively.*

## Usage
To use the package in your NPM based project run `npm install --save handwritten-mathematics-recogniser` it will install the distrubuted version of the package and list it as a dependency for your project.

To recognise a digit handwritten on a canvas:
```
// Import the digit recogniser.
import { HandwrittenDigitRecogniser } from 'handwritten-mathematics-recogniser/digit';

// Import the drawer.
import { Drawer } from 'handwritten-mathematics-recogniser/drawer';

const canvas = document.querySelector('#canvas');
const button = document.querySelector('#button');

// Allow drawing on a canvas.
const drawer = new Drawer(canvas);

// Recognise a digit.
button.addEventListener('click', () => {
  const digit = HandwrittenDigitRecogniser.recognise(canvas);
  console.log(digit);
});
```

To recognise an expression handwritten on a canvas:
```
// Import the expression recogniser.
import { HandwrittenExpressionRecogniser } from 'handwritten-mathematics-recogniser/expression';

// Import the drawer.
import { Drawer } from 'handwritten-mathematics-recogniser/drawer';

const canvas = document.querySelector('#canvas');
const button = document.querySelector('#button');

// Allow drawing on a canvas.
const drawer = new Drawer(canvas);

// Recognise an expression.
button.addEventListener('click', () => {
  const expression = HandwrittenExpressionRecogniser.recognise(canvas);
  console.log(expression);
});
```

## Development
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. Note that there are two different set of instructions for training and recognition.


### Prerequisites
To run the development mode you will need to install:

**Training**

- [Python](https://www.python.org/) - programming language that lets you work quickly.
and integrate systems more effectively.
- [TensorFlow](https://www.tensorflow.org/) - an open source machine learning framework used to obtained trained model of a neural network.

**Recognition**

- [NodeJS](https://nodejs.org/en/) - programming language that lets you work quickly.
and integrate systems more effectively.
- [NPM](https://www.tensorflow.org/) - node package manager.


### Installing
To develop either a training or recognition part of the package you need to clone the repository or download zipped archive.
```
git clone https://github.com/MaciejCaputa/handwritten-mathematics-recogniser.git
```

**Training**
Source the TensorFlow.
```
source ~/tensorflow/bin/activate
```

Navigate to the location of a training script and run it.
```
python train.py
```

**Recognition**
Navigate into it with a command line and install dependencies.
```
npm install
```

Run the development server which will automatically open your browser showcasing the recognition capability.
```
npm run serve
```

## Public API

`<recogniser>.recognise(HTMLCanvasElement): number`

`new Drawer(HTMLCanvasElement)`

`<recogniser>.recogniseWithMetadata(HTMLCanvasElement): Recognition[]`

## Handwritten Digit Recogniser
Recognises a single digit input with accuracy over 99% on the test data. For recognising multiple digits or more complex expressions use handwritten expression recogniser.

### Dataset
The datased for training and testing of the digit recogniser uses MNIST database of handwritten digits which contains a training set of 60,000 examples, and a test set of 10,000 examples.

### Public API

- `HandwrittenDigitRecogniser` - best-performing-neural-network based recognition (either DNN or CNN)
- `HandwrittenDigitRecogniserDNN` - deep-neural-network based recognition
- `HandwrittenDigitRecogniserCNN` - convolutional-neural-network based recognition



## Handwritten Expression Recogniser
Accurate and time efficient recognition of handwritten mathematical expressions. It recognises:

- classes:
  - digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
  - brackets: (, )
  - operations: +, -, ×, ÷, √
  - miscancelous: ., =
- relations:
  - power (superscript)
  - index (subscript)
  - fractions
  - roots

### Public API

- `HandwrittenExpressionRecogniserDNN` - deep-neural-network based recognition (either DNN or CNN)
- `HandwrittenExpressionDigitRecogniserCNN` - convolutional-neural-network based recognition
- `HandwrittenExpressionRecogniser` - best-performing-neural-network based recognition

### Limitations
At this point the recogniser does not supported nested expressions e.g. fraction inside a fraction. Moreover, it requires the handwritten symbols to be explicitly segmentable (two different symbols cannot be connected) and connected (strokes used to handwrite a symbol must intersect).

### Dataset

Dataset used for training and evaluation was extracted from CROHME original dataset. Only 21 classes has been extracted resulting in about 60,000 images and 6000 test data. In comparison each digit in MNIST data set had about 6000 training images whereas in this case each digit received only about 3000. To extend the variety in the dataset images were skewed by no more than 6 degrees in both directions. These resulted in obtaining a dataset to about 180,000 training images.


## Drawer
Provides a functionality to draw on a canvas. To use the recognisers it is not necessary to use the drawing functionality and developers might choose to implement their own solution for drawing.

### Public API

- `new Drawer(HTMLCanvasElement)` - binds to the specified canvas and listens to its touch/click events to provide the drawing feedback to the user.
- `new Drawer(HTMLCanvasElement).clear()` - clears the canvas to which the Drawer is binded to.


## Built With

**Classfication**

- [Python](https://www.python.org/) - programming language that lets you work quickly
and integrate systems more effectively.
- [TensorFlow](https://www.tensorflow.org/) - an open source machine learning framework used to obtained trained model of a neural network.

**Recognition**

- [NodeJS](https://nodejs.org/en/) - a JavaScript runtime built on Chrome's V8 JavaScript engine.
- [TypeScript](https://www.typescriptlang.org/) - a typed subset of JavaScript that compiles to plain JavaScript.


## Contributing

1. Fork it (<https://github.com/MaciejCaputa/handwritten-mathematics-recogniser>).
2. Create your feature branch (`git checkout -b feature/fooBar`).
3. Commit your changes (`git commit -am 'Add some fooBar'`).
4. Push to the branch (`git push origin feature/fooBar`).
5. Create a new Pull Request.


## Acknowledgments

- created as part of the dissertation for BSc Mathematics and Computing at Cardiff University
- supervised by Dr Xianfang Sun and moderated by Dr Frank Langbein
- Copyright (c) 2018 Maciej Caputa All Rights Reserved.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
