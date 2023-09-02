import * as THREE from 'three';
import scene from './scene';
import Factory from './mesh/Factory';

let factory = null;
export default function createMesh() {
  // 创建工厂
  factory = new Factory(scene);
}

export function updateMesh(time) {
  // factory.update(time);
}