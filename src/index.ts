// add styles
const styles = require('./style.css');

// three.js
import * as THREE from 'three'
import 'imports-loader?THREE=three!../node_modules/three/examples/js/controls/OrbitControls.js'

let scene = new THREE.Scene()

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

let controls = new THREE.OrbitControls(camera); // Add orbit controll function

let axis = new THREE.AxisHelper(10)
scene.add(axis)

let light = new THREE.DirectionalLight(0xffffff, 1.0)
light.position.set(100, 100, 100)
scene.add(light)

let light2 = new THREE.DirectionalLight(0xffffff, 1.0)
light2.position.set(-100, 100, -100)
scene.add(light2)

let grid = new THREE.GridHelper(1000, 10, new THREE.Color(0x0000ff));
scene.add(grid);

let material = new THREE.MeshBasicMaterial({
	color: 0xaaaaaa,
	wireframe: true
})

camera.position.x = 0
camera.position.y = 200
camera.position.z = 0

camera.lookAt(scene.position)

function animate(): void {
	requestAnimationFrame(animate)
	controls.update();
	render()
}

function render(): void {
	let timer = 0.002 * Date.now()
	renderer.render(scene, camera)
}

animate()

// Math
const deg2rad = degrees => {
	const kDegreeToRadian = 0.017453292519943295;
  return degrees * kDegreeToRadian;
};

// Websocket
const ws = new WebSocket('ws://localhost:5000');

const removeFromScene = (mesh: THREE.Mesh) => {
	scene.remove(mesh);
	mesh.geometry.dispose();
	mesh.material.dispose();
	mesh = undefined;
}

let spheres = [];

ws.onmessage = evt => {
  let msg = JSON.parse(evt.data);

	const x = Math.cos(deg2rad(msg.degree)) * msg.distance;
	const y = Math.sin(deg2rad(msg.degree)) * msg.distance;

	// Reset last result
	if (msg.removeFromScene) {
		spheres.forEach(s => {
			removeFromScene(s);
		});
		spheres　= [];
	}

	// Plot point
	if (x && y) {
		let sphere = new THREE.Mesh(                                        
			new THREE.SphereGeometry( 2, 50, 50 ),            
			new THREE.MeshPhongMaterial({                                      
				color: 0xFF0000
			})
		);
		scene.add(sphere);      
		sphere.position.set(x, 0, y); // y to z
		spheres.push(sphere);
	}

	// Device status
	if (msg.ready && msg.speed && msg.rate) {
		// Already exists
		if (document.getElementsByClassName(styles.textField).length > 0) {
			return;
		}
		
		// Create text field
		const textField = document.createElement('div');
		textField.classList.add(styles.textField);

		[msg.ready, msg.speed, msg.rate]
		.map((v, i) => {
			const p = document.createElement('p');
			p.textContent = Object.keys(msg)[i] + ': ' + v; // This method is bad. Fix later.
			return p;
		})
		.forEach(v => {
			textField.appendChild(v);
		});

		document.body.appendChild(textField);
	}

};