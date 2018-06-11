import { Point } from './point';

export class Mouse extends Point {
  public down = false;
  public px = 0;
  public py = 0;

  constructor() {
    super(0, 0);
  }
}
