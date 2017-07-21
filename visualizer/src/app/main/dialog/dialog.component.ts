import { Component, Input } from '@angular/core';
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

  constructor() { }

}
