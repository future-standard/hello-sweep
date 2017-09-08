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

  get availableSoundType() {
    return ['sine', 'square', 'sawtooth', 'triangle'];
  }

  changeType(type: any) {
    if (!this.availableSoundType.includes(type)) {
      return;
    }
    this.osc.stop();
    this.osc.disconnect();
    this.osc = this.context.createOscillator();
    this.osc.type = type;
    this.osc.connect(this.context.destination);
    this.play();
  }
}
