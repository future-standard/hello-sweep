import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AudioService {
  private context = new AudioContext();
  private osc = this.context.createOscillator();
  private gain = this.context.createGain();
  private lastGain: number;
  public gainValue = new BehaviorSubject<number>(this.gain.gain.value);

  constructor() {
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
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
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
    this.play();
  }

  mute() {
    this.lastGain = this.gain.gain.value;
    this.gain.gain.value = 0;
    this.gainValue.next(0);
  }

  unmute() {
    this.gain.gain.value = this.lastGain;
    this.gainValue.next(this.lastGain);
  }

  changeVolume(gain: number) {
    // Muted
    if (this.gain.gain.value === 0) {
      return;
    }
    this.gain.gain.value = gain;
    this.gainValue.next(gain);
  }
}
