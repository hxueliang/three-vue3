import { createRouter, createWebHistory } from 'vue-router';
import caseRoutes from "./caseRoutes";
import baseRoutes from "./baseRoutes";
import highRoutes from "./highRoutes";
import testRoutes from "./testRoutes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...caseRoutes,
    ...baseRoutes,
    ...highRoutes,
    ...testRoutes,
  ]
});

export default router;
