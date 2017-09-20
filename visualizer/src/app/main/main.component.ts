import { Component, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { DeviceStatus } from '../../models/devicestatus';
import { SoundStatus } from '../../models/soundstatus';
import { rendererSetting } from '../../models/renderersetting';
import { SweepService } from '../sweep.service';
import { AudioService } from '../audio.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  msg: any;
  deviceStatus: DeviceStatus;
  soundStatus:  SoundStatus;

  constructor(public sweep: SweepService, public audio: AudioService) {
    const dots: {x: number, y: number}[] = [];
    this.sweep.msg.subscribe(msg => {
      // Pass to child component
      this.msg = msg;

      // Reset last result
      if (msg.removeFromScene) {
        dots.splice(0, dots.length);
        return;
      }

      this.deviceStatus = {
        ready: msg.ready,
        speed: msg.speed,
        rate: msg.rate
      };

      const x = Math.cos(this.deg2rad(msg.degree)) * msg.distance;
      const y = Math.sin(this.deg2rad(msg.degree)) * msg.distance;
      dots.push({x, y});
      // Plot point
      if (x && y && Math.abs(x) < rendererSetting.gridSize / 2 && Math.abs(y) < rendererSetting.gridSize / 2) {

        // Change pitch if a dot is on the pitchPlane
        const dist = this.calcDist(dots, rendererSetting.planeWidth, 'pitch');
        if (!dist) {
          return;
        }

        const freq = dist * 10;
        this.soundStatus = {
          frequency: freq,
          distance: dist
        };

        this.audio.changePitch(freq);
        // Already playing, do nothing
        try {
          this.audio.play();
        } catch (error) {
          return;
        }

        // Change pitch if a dot is on the volumePlane
        const d = this.calcDist(dots, rendererSetting.planeWidth, 'volume');
        if (!d) {
          return;
        }

        this.audio.changeVolume(d / 30);
      }
    });
  }

  deg2rad(degrees: number) {
    const kDegreeToRadian = 0.017453292519943295;
    return degrees * kDegreeToRadian;
  }

  calcDist(dots: {x: number, y: number}[], planeWidth: number, laneType: string): number {
    if (!dots.length) {
      return undefined;
    }

    const nearestDotOnPlane = dots
    .filter(dot => {
      const pos = laneType === 'pitch' ? dot.x : dot.y;
      return Math.abs(pos) < planeWidth / 2;
    })
    // Remove dots which are too close to device(center)
    .filter(dotOnVolumePlane => {
      return Math.sqrt(Math.pow(dotOnVolumePlane.x - 0, 2) + Math.pow(dotOnVolumePlane.y - 0, 2));
    })
    .sort((a, b) => {
      const toA: number = Math.sqrt(Math.pow(a.x - 0, 2) + Math.pow(a.y - 0, 2));
      const toB: number = Math.sqrt(Math.pow(b.x - 0, 2) + Math.pow(b.y - 0, 2));
      return toA - toB;
    })[0];

    if (!nearestDotOnPlane) {
      return undefined;
    }

    return Math.sqrt(Math.pow(nearestDotOnPlane.x - 0, 2) + Math.pow(nearestDotOnPlane.y - 0, 2));
  }

}
