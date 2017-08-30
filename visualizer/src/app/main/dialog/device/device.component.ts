import { Component, OnInit, Input } from '@angular/core';
import { DeviceStatus } from '../../../../models/devicestatus'

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {
  @Input() status: DeviceStatus;

  constructor() { }

  ngOnInit() {
  }

}
