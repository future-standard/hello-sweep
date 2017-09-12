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
  private muted = false;
  private muteOrUnmute = 'mute';

  constructor(public audio: AudioService) {
    audio.gainValue.subscribe(gain => {
      if (gain > 0) {
        this.muted = false;
        this.muteOrUnmute = 'mute';
      } else {
        this.muted = true;
        this.muteOrUnmute = 'unmute';
      }
    });
  }

  onSoundTypeSelect(type: string) {
    this.audio.changeType(type);
  }

  onClick() {
    if (this.muted) {
      this.audio.unmute();
    } else {
      this.audio.mute();
    }
  }

}
