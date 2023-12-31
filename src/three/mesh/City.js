import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import scene from '../scene';
import modifyCityMaterial from '../modify/modifyCityMaterial';
import FlyLine from './FlyLine';
import FlyLineShader from './FlyLineShader';
import MeshLine from './MeshLine';
import LightWall from './LightWall';
import LightRadar from './LightRadar';
import AlarmSprite from './AlarmSprite';


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
        // 给建筑物描边
        if (item.name === 'Layerbuildings') {
          const meshLine = new MeshLine(item.geometry);
          const scaleX = item.scale.x;
          meshLine.mesh.scale.set(scaleX, scaleX, scaleX);
          scene.add(meshLine.mesh);
        }
      }
    });
    scene.add(gltfScene);
  });

  // 添加飞线，用管道几何体实现
  // const flyLine = new FlyLine();
  // scene.add(flyLine.mesh);

  // 添加飞线，用着色器实现
  // const flyLineShader = new FlyLineShader();
  // scene.add(flyLineShader.mesh);

  // 添加光墙
  // const lightWall = new LightWall();
  // scene.add(lightWall.mesh);

  // 添加雷达
  // const lightRader = new LightRadar();
  // scene.add(lightRader.mesh);

  // 添加警告图标
  // const alarmSprite = new AlarmSprite();
  // scene.add(alarmSprite.mesh);
  // let div = null;
  // alarmSprite.onClick(event => {
  //   if (!div) {
  //     div = document.createElement('div');
  //     div.innerHTML = '305有火灾';
  //     div.style.cssText = 'position: fixed; color: #f00;';
  //     document.body.appendChild(div);
  //   } else {
  //     document.body.removeChild(div);
  //     div = null;
  //   }
  // });
}