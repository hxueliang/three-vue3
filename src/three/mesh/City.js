import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import scene from '../scene';
import modifyCityMaterial from '../modify/modifyCityMaterial';
import FlyLine from './FlyLine';
import FlyLineShader from './FlyLineShader';


export default function createCity() {
  const gltfLoader = new GLTFLoader();
  const material = new THREE.MeshBasicMaterial({
    color: 0x0c0c6f
  });
  gltfLoader.load('./model/city/city.glb', gltf => {
    const gltfScene = gltf.scene;
    gltfScene.traverse(item => {
      if (item.type === 'Mesh') {
        item.material = material;
        modifyCityMaterial(item);
      }
    });
    scene.add(gltfScene);
  });

  // 添加飞线，用管道几何体实现
  const flyLine = new FlyLine();
  scene.add(flyLine.mesh);

  // 添加飞线，用着色器实现
  const flyLineShader = new FlyLineShader();
  scene.add(flyLineShader.mesh);
}