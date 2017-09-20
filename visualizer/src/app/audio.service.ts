import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AudioService {
  public static readonly DEFAULT_GAIN_VALUE: number = 1.0;
  public static readonly DEFAULT_FREQ_VALUE: number = 442;

  private context = new AudioContext();
  private osc = this.context.createOscillator();
  private gain = this.context.createGain();
  private lastGain: number;

  public gainValue = new BehaviorSubject<number>(AudioService.DEFAULT_GAIN_VALUE);

  constructor() {
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
  }

  play() {
    this.osc.start();
  }

  changePitch(freq = AudioService.DEFAULT_FREQ_VALUE) {
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
