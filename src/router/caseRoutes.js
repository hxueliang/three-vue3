export default [
  {
    path: '/house',
    name: 'caseHouse',
    component: () => import('@/views-case/HouseView.vue')
  },
  {
    path: '/island',
    name: 'caseIsland',
    component: () => import('@/views-case/IslandView.vue')
  },
  {
    path: '/testView',
    name: 'caseTestView',
    component: () => import('@/views-case/TestView.vue')
  },
  {
    path: '/carView',
    name: 'caseCarView',
    component: () => import('@/views-case/CarView.vue')
  }
];
