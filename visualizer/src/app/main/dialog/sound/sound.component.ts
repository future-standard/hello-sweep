import { Component, Input } from '@angular/core';
import { SoundStatus } from "../../../../models/soundstatus";

import { AudioService } from "../../../audio.service";

@Component({
  selector: 'app-sound',
  templateUrl: './sound.component.html',
  styleUrls: ['./sound.component.css']
})
export class SoundComponent {
  @Input() status: SoundStatus;
  private availableSoundType = this.audio.availableSoundType;

  constructor(public audio: AudioService) { }

  ngOnInit() {
  }

  onSoundTypeSelect(type: string) {
    this.audio.changeType(type);
  }

}
