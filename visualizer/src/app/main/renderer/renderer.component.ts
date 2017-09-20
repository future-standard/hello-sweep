import { Component, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import * as THREE from 'three';
const OrbitControls = require('three-orbit-controls')(THREE);
import { rendererSetting } from '../../../models/renderersetting';
import { SweepMessage } from '../../../models/message';

@Component({
  selector: 'app-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.css']
})
export class RendererComponent implements OnChanges {

  @ViewChild('rendererContainer') rendererContainer: ElementRef;

  @Input() msg: SweepMessage;
  dots = [];
  scene:    THREE.Scene;
  camera:   THREE.Camera;
  renderer: THREE.WebGLRenderer;
  controls: THREE.OrbitControls;

  constructor() { }

  removeFromScene(mesh: THREE.Mesh) {
    this.scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh = undefined;
  }

  deg2rad(degrees: number) {
    const kDegreeToRadian = 0.017453292519943295;
    return degrees * kDegreeToRadian;
  }

  render() {
    const timer = 0.002 * Date.now();
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.render();
  }

  ngOnChanges() {
    // Canvas has not been inited yet
    if (!this.scene) {
      return;
    }

    const x = Math.cos(this.deg2rad(this.msg.degree)) * this.msg.distance;
    const y = Math.sin(this.deg2rad(this.msg.degree)) * this.msg.distance;

    // Reset last result
    if (this.msg.removeFromScene) {
      this.dots.forEach(dot => this.removeFromScene(dot));
      this.dots = [];
    }

    // Plot point
    if (x && y && Math.abs(x) < rendererSetting.gridSize / 2 && Math.abs(y) < rendererSetting.gridSize / 2) {
      const dotGeometry = new THREE.Geometry();
      dotGeometry.vertices.push(new THREE.Vector3(x, 0, y));
      const dotMaterial = new THREE.PointsMaterial( { size: 3, sizeAttenuation: false } );
      const dot = new THREE.Points( dotGeometry, dotMaterial );
      this.scene.add(dot);
      this.dots.push(dot);
    }
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, rendererSetting.gridSize * 2);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement); // Add orbit controll function

    // Add plane for adjusting pitch & volume
    const pitchGeo = new THREE.PlaneBufferGeometry(rendererSetting.gridSize, rendererSetting.planeWidth, 8, 8);
    const pitchMat = new THREE.MeshBasicMaterial({ color: 0x000033, side: THREE.DoubleSide });
    const pitchPlane = new THREE.Mesh(pitchGeo, pitchMat);
    pitchPlane.rotateX(- Math.PI / 2);

    this.scene.add(pitchPlane);

    const volumeGeo = new THREE.PlaneBufferGeometry(rendererSetting.planeWidth, rendererSetting.gridSize, 8, 8);
    const volumeMat = new THREE.MeshBasicMaterial({ color: 0x330000, side: THREE.DoubleSide });
    const volumePlane = new THREE.Mesh(volumeGeo, volumeMat);
    volumePlane.rotateX(- Math.PI / 2);

    this.scene.add(volumePlane);

    const axis = new THREE.AxisHelper(10);
    this.scene.add(axis);

    const grid = new THREE.GridHelper(rendererSetting.gridSize, 10, new THREE.Color(0x0000ff));
    this.scene.add(grid);

    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(100, 100, 100);
    this.scene.add(light);

    const light2 = new THREE.DirectionalLight(0xffffff, 1.0);
    light2.position.set(-100, 100, -100);
    this.scene.add(light2);

    // Set camera position
    this.camera.position.x = 0;
    this.camera.position.y = 200;
    this.camera.position.z = 0;

    this.camera.lookAt(this.scene.position);

    // animation start
    this.animate();
  }

}
