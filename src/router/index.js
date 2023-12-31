import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/house',
      name: 'house',
      component: () => import('../views/HouseView.vue')
    },
    {
      path: '/island',
      name: 'island',
      component: () => import('../views/IslandView.vue')
    },
    {
      path: '/testView',
      name: 'testView',
      component: () => import('../views/TestView.vue')
    },
    {
      path: '/carView',
      name: 'carView',
      component: () => import('../views/CarView.vue')
    },
    {
      path: '/base',
      name: 'base',
      component: () => import('../views/BaseView/13.2.打印模型结构.vue')
    },
    {
      path: '/high',
      name: 'high',
      component: () => import('../views-high/02四元数/03四元数表示两个向量旋转.vue')
    },
    {
      path: '/cesium',
      name: 'cesium',
      component: () => import('../views/BaseView33/Cesium44.vue')
    },
    {
      path: '/atest',
      name: 'atest',
      component: () => import('../views/atest/atest01.vue')
    },
  ]
});

export default router;
