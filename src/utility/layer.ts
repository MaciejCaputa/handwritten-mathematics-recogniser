import { Coordinate } from './coordinate';
import { BoundingBox } from './bounding-box';

export interface Layer {
  // Center of the entity in the original image.
  center: Coordinate;

  // Bounding box on original image.
  boundingBox: BoundingBox;

  width?: number;
  height?: number;

  // Cropped image.
  image: number[][];

  recognition?: string | number;
}
