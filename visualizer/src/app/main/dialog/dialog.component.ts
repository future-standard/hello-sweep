import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DeviceStatus } from "../../../models/devicestatus";
import { SoundStatus } from "../../../models/soundstatus";

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  @Input() deviceStatus: DeviceStatus;
  @Input() soundStatus:  SoundStatus;

  private selectedMode = 'dialog';
  private notSelectedMode = 'visualizer';

  constructor() {}

  onClick() {
    const notSelectedMode = this.notSelectedMode;
    this.notSelectedMode = this.selectedMode;
    this.selectedMode = notSelectedMode;
  }

}
