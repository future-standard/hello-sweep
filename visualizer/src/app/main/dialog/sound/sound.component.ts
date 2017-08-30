import { Component, Input } from '@angular/core';
import { SoundStatus } from "../../../../models/soundstatus";

@Component({
  selector: 'app-sound',
  templateUrl: './sound.component.html',
  styleUrls: ['./sound.component.css']
})
export class SoundComponent {
  @Input() status: SoundStatus;

  constructor() { }

  ngOnInit() {
  }

}
