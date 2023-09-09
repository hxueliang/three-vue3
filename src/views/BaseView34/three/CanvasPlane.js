import * as THREE from 'three';

export default class CanvasPlane {
  constructor(
    scene,
    text = 'hello world',
    position = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Euler(0, -Math.PI / 2, 0)
  ) {

    const canvas = document.createElement('canvas');
    this.canvas = canvas;
    canvas.width = 1024;
    canvas.height = 1024;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    canvas.style.transformOrigin = 'left top';
    canvas.style.transform = 'scale(0.1)';
    const context = canvas.getContext('2d');

    const image = new Image();
    image.src = './textures/metaverse/frame2.png';
    image.onload = () => {
      context.drawImage(image, 0, 0, 1024, 1024);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = 'bold 120px Arial';
      context.fillStyle = 'rgba(0, 255, 255, 1)';
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: texture,
        alphaMap: texture,
        transparent: true,
        depthWrite: false,
        needsUpdate: true,
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.copy(position);
      this.mesh.rotation.copy(rotation);
      scene.add(this.mesh);
    };

  }

}