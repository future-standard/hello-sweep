import { Component, Input } from '@angular/core';
import { DeviceStatus } from '../../../../models/devicestatus';

import { SweepService } from '../../../sweep.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent {
  @Input() status: DeviceStatus;

  private availableSamplingRate = [500, 750, 1000];
  private availableSpeed = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(public sweep: SweepService) { }

  onSamplingRateChange(value: string) {
    const n = parseInt(value, 10);
    if (n) {
      this.sweep.send(JSON.stringify({
        'sampleRate': n
      }))
      .catch(error => console.error('error while sending', error));
    }
  }

  onSpeedChange(value: string) {
    const n = parseInt(value, 10);
    if (n) {
      this.sweep.send(JSON.stringify({
          'motorSpeed': n
      }))
      .catch(error => console.error('error while sending', error));
    }
  }

}
