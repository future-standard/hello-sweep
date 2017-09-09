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

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement); // Add orbit controll function

    let axis = new THREE.AxisHelper(10);
    this.scene.add(axis);

    let grid = new THREE.GridHelper(1000, 10, new THREE.Color(0x0000ff));
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

        // Change pitch
        let nearestDot = dots
        // Remove dots which are too close to device(center)
        .filter(dot => {
          const bbox = new THREE.Box3().setFromObject(dot);
          return bbox.getCenter().distanceTo(new THREE.Vector3(0, 0, 0)) > 3;
        })
        .sort((a, b) => {
          const bboxA = new THREE.Box3().setFromObject(a);
          const bboxB = new THREE.Box3().setFromObject(b);
          let toA: number = bboxA.getCenter().distanceTo(new THREE.Vector3(0, 0, 0));
          let toB: number = bboxB.getCenter().distanceTo(new THREE.Vector3(0, 0, 0));
          return toA - toB
        })[0];

        if (!nearestDot) {
          return;
        }
        const bbox = new THREE.Box3().setFromObject(nearestDot);

        const dist = bbox.getCenter().distanceTo(new THREE.Vector3(0, 0, 0));
        const freq = dist * 10;
        this.soundStatus = new SoundStatus(freq, dist);

        this.audio.changePitch(freq);
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

}
