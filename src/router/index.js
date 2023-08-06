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
  ]
});

export default router;
