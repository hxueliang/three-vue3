import * as THREE from 'three';

export default class VideoPlane {
  constructor(
    url,
    size = new THREE.Vector2(1, 1),
    position = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Vector3(0, 0, 0),
  ) {
    const geometry = new THREE.PlaneGeometry(size.x, size.y, 1, 1);

    // 加载视频
    this.video = document.createElement('video');
    this.video.src = url;
    // 静音，设置静音才能自动播放
    this.video.muted = true;
    this.video.loop = true;
    this.video.play();
    // 创建视频纹理
    const texture = new THREE.VideoTexture(this.video);

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      // 使用视频纹理
      map: texture,
      alphaMap: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    console.log(this.mesh);
  }
}