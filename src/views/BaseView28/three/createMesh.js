import * as THREE from 'three';
import scene from './scene';
import Area from './mesh/Area';

let area = null;
export default function createMesh() {
  // 创建城市
  area = new Area(scene);
}