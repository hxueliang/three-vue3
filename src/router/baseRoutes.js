export default [
  {
    path: '/base2',
    name: 'base2',
    component: () => import('../views-base/02入门与调试/15.补间动画Tween.vue')
  },
  {
    path: '/base3',
    name: 'base3',
    component: () => import('../views-base/03Geometry/24.模型里所有的物体都转为线框.vue')
  },
  {
    path: '/base4',
    name: 'base4',
    component: () => import('../views-base/04纹理与材质/39.限制控制器位移_旋转角度.vue')
  },
  {
    path: '/cesium',
    name: 'cesium',
    component: () => import('../views-base/BaseView33/Cesium44.vue')
  },
];
