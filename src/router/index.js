// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'Dashboard | InvestmentAI'
    }
  },
  {
    path: '/rooms',
    name: 'rooms',
    component: () => import('../views/RoomsView.vue'),
    meta: {
      title: 'Investment Rooms | InvestmentAI'
    }
  },
  // {
  //   path: '/market',
  //   name: 'market',
  //   component: () => import('../views/MarketView.vue'),
  //   meta: {
  //     title: 'Market Data | InvestmentAI'
  //   }
  // },
  // {
  //   path: '/settings',
  //   name: 'settings',
  //   component: () => import('../views/SettingsView.vue'),
  //   meta: {
  //     title: 'Settings | InvestmentAI'
  //   }
  // },
  // {
  //   path: '/:pathMatch(.*)*',
  //   name: 'not-found',
  //   component: () => import('../views/NotFoundView.vue'),
  //   meta: {
  //     title: 'Page Not Found | InvestmentAI'
  //   }
  // }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Update document title based on route
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'InvestmentAI';
  next();
});

export default router;
