import {
  Scene,
  Color,
  Mesh,
  MeshNormalMaterial,
  BoxBufferGeometry,
  PerspectiveCamera,
  WebGLRenderer
} from "three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "stats.js";

function N(i, k, t, u) {
  if (k === 1) {
    return u[i] <= t && t <= u[i + 1] ? 1 : 0;
  }

  const termLeft =
    u[i + k - 1] - u[i]
      ? ((t - u[i]) * N(i, k - 1, t, u)) / (u[i + k - 1] - u[i])
      : 0;
  const termRight =
    u[i + k] - u[i + 1]
      ? ((u[i + k] - t) * N(i + 1, k - 1, t, u)) / (u[i + k] - u[i + 1])
      : 0;
  //console.log(termLeft + termRight)
  return termLeft + termRight;
}

class Example {
  constructor() {
    this.init = this.init.bind(this);
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    this.init();
  }

  init() {
    this.aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera(50, this.aspect, 1, 1000);
    this.camera.position.z = 700;

    this.controls = new OrbitControls(this.camera);

    this.geometry = new THREE.Geometry();
    this.nurbsGeometry = new THREE.Geometry();
    this.material = new THREE.PointsMaterial({ color: 0x00ff00 });
    this.nurbsMaterial = new THREE.PointsMaterial({ color: 0x00ffff });
    const k = 4;
    const l = 3;
    const knotX = [0, 0, 0, 0, 1, 1, 1, 1];
    const knotY = [0, 0, 0, 1, 2, 2, 2];

    this.vertices = [
      [-100, 0, 0],
      [-50, 100, 0],
      [0, 0, 0],
      [50, 100, 0],
      [100, 0, 0],
      [150, 100, 0]
    ];
    this.vertices2 = [[-100, 0, 0], [-50, 100, 0], [0, 0, 0], [50, 100, 0]];
    this.vertices3 = [
      [-15, 0, 15],
      [-5, 5, 15],
      [5, 5, 15],
      [15, 0, 15],

      [-15, 5, 5],
      [-5, 10, 5],
      [5, 10, 5],
      [15, 5, 5],

      [-15, 5, -5],
      [-5, 10, -5],
      [5, 10, -5],
      [15, 5, -5],

      [-15, 0, -15],
      [-5, 5, -15],
      [5, 5, -15],
      [15, 0, -15]
    ];

    //knot vector
    this.knot = [0, 0, 0, 1, 1, 2, 2, 3, 3, 3];
    this.knot1 = [0, 0, 0, 1, 2, 2, 2];

    this.vertices3.forEach(v => {
      this.geometry.vertices.push(new THREE.Vector3().fromArray(v));
    });
    this.points = this.vertices3.map(v => new THREE.Vector3().fromArray(v));
    const step = 0.001*4;
    for (let u =0; u <= 1; u+= step){
      for (let w = 0; w<= 2; w+= step){
        const vertex = new THREE.Vector3(0, 0, 0);
        for (let i =0 ; i < 4; i++){
          const vertex2 = new THREE.Vector3(0, 0, 0);
          for (let j = 0; j < 4; j++){
            const basis =  N(j,l, w, knotY);
            const {x, y, z} = this.points[4*j + i];
            vertex2.x += x*basis;
            vertex2.y += y*basis;
            vertex2.z += z*basis;
          }
          const basis = N(i, k, u, knotX);
          const {x, y, z} = vertex2;
          vertex.x += x*basis;
          vertex.y += y*basis;
          vertex.z += z*basis;
        }
        this.nurbsGeometry.vertices.push(vertex);
      }
    }
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.nurbsMesh = new THREE.Points(this.nurbsGeometry, this.nurbsMaterial);
    console.log(this.vertices);
    this.scene = new Scene();
    this.scene.background = new Color("#191919");
    //this.scene.add(this.mesh);
    this.scene.add(this.nurbsMesh);

    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true
    });

    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.onWindowResize);

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setAnimationLoop(this.animate);
  }

  animate() {
    this.stats.begin();

    this.nurbsMesh.rotation.x += 0.005;
    this.nurbsMesh.rotation.y += 0.001;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.stats.end();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

new Example();