import { Component, Input } from '@angular/core';
import { SoundStatus } from '../../../../models/soundstatus';

import { AudioService } from '../../../audio.service';

@Component({
  selector: 'app-sound',
  templateUrl: './sound.component.html',
  styleUrls: ['./sound.component.css']
})
export class SoundComponent {
  @Input() status: SoundStatus;
  private availableSoundType = this.audio.availableSoundType;
  private mute = false;
  private muteOrUnmute = 'mute';

  constructor(public audio: AudioService) { }

  onSoundTypeSelect(type: string) {
    this.audio.changeType(type);
  }

  onClick() {
    if (this.mute) {
      this.audio.unmute();
      this.muteOrUnmute = 'mute';
    } else {
      this.audio.mute();
      this.muteOrUnmute = 'unmute';
    }

    this.mute = !this.mute;
  }

}
