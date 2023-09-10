import * as THREE from 'three';
import gsap from 'gsap';
import SpriteText from '../SpriteText';

const dataExamples = [
  { value: 4.5, name: '第一季度' },
  { value: 3.0, name: '第二季度' },
  { value: 1.0, name: '第三季度' },
  { value: 3.5, name: '第四季度' },
];
const { sin, cos, random, PI } = Math;

export default class Pie3d {
  constructor(camera, data = dataExamples) {
    const Radius = 3;
    const Base_Height = 5;
    let sum = 0;
    let sumRotation = 0;

    this.camera = camera;
    this.mesh = new THREE.Group();

    data.forEach(item => sum += item.value);

    data.forEach(item => {
      const { value } = item;
      const rotation = (value / sum) * 2 * PI;

      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      let rad = 0;
      while (rad < rotation) {
        shape.lineTo(Radius * cos(rad), Radius * sin(rad));
        rad += 0.05;
      }
      shape.lineTo(Radius * cos(rotation), Radius * sin(rotation));
      shape.lineTo(0, 0);
      const extrudeSettings = {
        steps: 2,
        depth: (value / sum) * Base_Height,
        bevelEnabled: false,
        bevelThickness: 1,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5
      };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(random() * 0xffffff),
        side: THREE.DoubleSide,
        opacity: 0.8,
        transparent: true,
      });

      const cylinder = new THREE.Mesh(geometry, material);
      cylinder.rotation.z = sumRotation;
      cylinder.halfRotation = rotation / 2; // 用于移动饼图
      this.mesh.add(cylinder);

      // 添加文字精灵
      const position = new THREE.Vector3(
        Radius / 2 * cos(rotation / 2),
        Radius / 2 * sin(rotation / 2),
        value / 2 + 0.5
      );
      const spriteText = new SpriteText(item.name, position);
      cylinder.add(spriteText.mesh);

      sumRotation += rotation;
    });

    this.mesh.rotation.x = - PI / 2;

    this.addMouseMove();
  }

  addMouseMove() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(1, 1);
    this.timeline = gsap.timeline();
    this.currentPie = null;
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX / window.innerWidth * 2 - 1;
      this.mouse.y = -(e.clientY / (1080 * (window.innerWidth / 1920)) * 2 - 1);
    });
  }

  update() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.mesh.children, false);
    if (intersects.length && !this.currentPie && !this.timeline.isActive()) {
      this.currentPie = intersects[0].object;
      console.log(this.currentPie);
      let { z } = this.currentPie.rotation;
      let { halfRotation } = this.currentPie;
      z += halfRotation;
      console.log(cos(z), sin(z));
      this.timeline.to(this.currentPie.position, {
        x: 1 * cos(z),
        y: 1 * sin(z),
        duration: 0.5,
      });
    }

    // 如果鼠标从当前的扇形移动到另外一个扇形，那么就将之前的扇形移动回来，将当前的扇形根据当前的角度移动
    if (
      intersects.length &&
      this.currentPie &&
      this.currentPie !== intersects[0].object &&
      !this.timeline.isActive()
    ) {
      this.timeline.to(this.currentPie.position, {
        x: 0,
        y: 0,
        duration: 0.1,
      });
      this.currentPie = intersects[0].object;
      let { z } = this.currentPie.rotation;
      let { halfRotation } = this.currentPie;
      z += halfRotation;
      this.timeline.to(this.currentPie.position, {
        x: 1 * cos(z),
        y: 1 * sin(z),
        duration: 0.5,
      });
    }

    // 当鼠标移出时，currentPie设置为null，并恢复原点的位置
    if (!intersects.length && this.currentPie && !this.timeline.isActive()) {
      this.timeline.to(this.currentPie.position, {
        x: 0,
        y: 0,
        duration: 0.5,
        onComplete: () => {
          console.log('onComplete');
          this.currentPie = null;
        }
      });
    }
  }
}
