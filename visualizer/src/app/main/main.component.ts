import { Component, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { DeviceStatus } from "../../models/devicestatus";
import { SoundStatus } from "../../models/soundstatus";
import { SweepService } from "../sweep.service";
import { AudioService } from "../audio.service";
import 'rxjs/add/operator/first';

const OrbitControls = require('three-orbit-controls')(THREE);

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {

  @ViewChild('rendererContainer') rendererContainer: ElementRef;

  scene:        THREE.Scene;
  camera:       THREE.Camera;
  renderer:     THREE.WebGLRenderer;
  controls:     THREE.OrbitControls;
  deviceStatus: DeviceStatus;
  soundStatus:  SoundStatus;

  constructor(public sweep: SweepService, public audio: AudioService) { }

  removeFromScene(mesh: THREE.Mesh) {
    this.scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh = undefined;
  }

  // Math
  deg2rad(degrees: number) {
    const kDegreeToRadian = 0.017453292519943295;
    return degrees * kDegreeToRadian;
  };

  ngAfterViewInit() {
    this.scene = new THREE.Scene();

    const gridSize = 1000;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, gridSize * 2);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement); // Add orbit controll function

    // Add plane for adjusting pitch & volume
    const planeWidth = 30;
    const pitchGeo = new THREE.PlaneBufferGeometry(gridSize, planeWidth, 8, 8);
    const pitchMat = new THREE.MeshBasicMaterial({ color: 0x000033, side: THREE.DoubleSide });
    const pitchPlane = new THREE.Mesh(pitchGeo, pitchMat);
    pitchPlane.rotateX(- Math.PI / 2);

    this.scene.add(pitchPlane);

    const volumeGeo = new THREE.PlaneBufferGeometry(planeWidth, gridSize, 8, 8);
    const volumeMat = new THREE.MeshBasicMaterial({ color: 0x330000, side: THREE.DoubleSide });
    const volumePlane = new THREE.Mesh(volumeGeo, volumeMat);
    volumePlane.rotateX(- Math.PI / 2);

    this.scene.add(volumePlane);

    let axis = new THREE.AxisHelper(10);
    this.scene.add(axis);

    let grid = new THREE.GridHelper(gridSize, 10, new THREE.Color(0x0000ff));
    this.scene.add(grid);

    let light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(100, 100, 100);
    this.scene.add(light);

    let light2 = new THREE.DirectionalLight(0xffffff, 1.0);
    light2.position.set(-100, 100, -100);
    this.scene.add(light2);

    // Set camera position
    this.camera.position.x = 0;
    this.camera.position.y = 200;
    this.camera.position.z = 0;

    this.camera.lookAt(this.scene.position);

    // animation start
    this.animate();

    let dots = [];
    this.sweep.msg.first(msg => msg.degree && msg.distance, this.audio.play());
    this.sweep.msg.subscribe(msg => {
      // Device status
      this.deviceStatus = new DeviceStatus(msg.ready, msg.speed, msg.rate);

	    const x = Math.cos(this.deg2rad(msg.degree)) * msg.distance;
	    const y = Math.sin(this.deg2rad(msg.degree)) * msg.distance;

      // Reset last result
      if (msg.removeFromScene) {
        dots.forEach(s => {
          this.removeFromScene(s);
        });
        dots　= [];
      }

      // Plot point
      if (x && y) {
        const dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(new THREE.Vector3(x, 0, y));
        const dotMaterial = new THREE.PointsMaterial( { size: 3, sizeAttenuation: false } );
        const dot = new THREE.Points( dotGeometry, dotMaterial );
        this.scene.add(dot);
        dots.push(dot);

        // Change pitch if a dot is on the pitchPlane
        const dist = this.calcDist(dots, planeWidth, 'pitch');
        if (!dist) {
          return;
        }

        const freq = dist * 10;
        this.soundStatus = new SoundStatus(freq, dist);

        this.audio.changePitch(freq);

        // Change pitch if a dot is on the pitchPlane
        const d = this.calcDist(dots, planeWidth, 'volume');
        if (!d) {
          return;
        }

        this.audio.changeVolume(d / 30);
      }
    });
  }

  render() {
    let timer = 0.002 * Date.now();
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
	  this.controls.update();
	  this.render();
  };

  calcDist(dots: any[], planeWidth: number, laneType: string): number {
    const nearestDotOnPlane = dots
    .filter(dot => {
      const bbox = new THREE.Box3().setFromObject(dot);
      const pos = laneType === 'pitch' ? bbox.getCenter().x : bbox.getCenter().y;
      return Math.abs(pos) < planeWidth / 2;
    })
    // Remove dots which are too close to device(center)
    .filter(dotOnVolumePlane => {
      const bbox = new THREE.Box3().setFromObject(dotOnVolumePlane);
      return bbox.getCenter().distanceTo(new THREE.Vector3(0, 0, 0)) > 3;
    })
    .sort((a, b) => {
      const bboxA = new THREE.Box3().setFromObject(a);
      const bboxB = new THREE.Box3().setFromObject(b);
      const toA: number = bboxA.getCenter().distanceTo(new THREE.Vector3(0, 0, 0));
      const toB: number = bboxB.getCenter().distanceTo(new THREE.Vector3(0, 0, 0));
      return toA - toB;
    })[0];

    if (!nearestDotOnPlane) {
      return undefined;
    }
    const bbox = new THREE.Box3().setFromObject(nearestDotOnPlane);

    const dist = bbox.getCenter().distanceTo(new THREE.Vector3(0, 0, 0));
    return dist;
  }

}
