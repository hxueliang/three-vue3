import * as THREE from 'three';
import SpriteText from '../SpriteText';

const dataExamples = [
  { value: 3.5, name: '第一季度' },
  { value: 2.5, name: '第二季度' },
  { value: 3.1, name: '第三季度' },
  { value: 3.9, name: '第四季度' },
];

export default class Bar3d {
  constructor(data = dataExamples, type = 'cylinder') {
    this.mesh = new THREE.Group();
    data.forEach((item, i) => {
      let geometry = null;
      if (type === 'rect') {
        geometry = new THREE.BoxGeometry(1, item.value, 1);
      } else {
        geometry = new THREE.CylinderGeometry(0.5, 0.5, item.value);
      }

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(Math.random() * 0xffffff),
        transparent: true,
        opacity: 0.8,
      });

      const cube = new THREE.Mesh(geometry, material);
      console.log(new THREE.Vector3(-3 + i * 2, item.value / 2, 0));
      cube.position.set(-3 + i * 2, item.value / 2, 0); // y轴移上自身高度的一半
      this.mesh.add(cube);

      // 添加文字精灵
      const position = new THREE.Vector3(-3 + i * 2, item.value + 0.5, 0);
      const spriteText = new SpriteText(item.name, position);
      this.mesh.add(spriteText.mesh);
    });
  }
}
