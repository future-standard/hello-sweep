import { Component, Input } from '@angular/core';
import { DeviceStatus } from "../../../models/devicestatus";

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  @Input() status: DeviceStatus;

  constructor() { }

}
