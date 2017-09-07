import { Injectable } from '@angular/core';

@Injectable()
export class AudioService {
  private context = new AudioContext();
  private osc = this.context.createOscillator();

  constructor() {
    this.osc.connect(this.context.destination);
  }

  play() {
    this.osc.start();
  }

  changePitch(freq=442) {
    this.osc.frequency.value = freq;
  }
}
