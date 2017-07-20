export class DeviceStatus {
  ready: boolean;
  speed: number;
  rate:  number;

  constructor(
    ready: boolean,
    speed: number,
    rate:  number
  ) {
    this.ready = ready;
    this.speed = speed;
    this.rate  = rate;
  }
}