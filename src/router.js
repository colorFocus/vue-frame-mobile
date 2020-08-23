import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const routes = [
  {
    path: '*',
    redirect: '/goods'
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/views/User.vue'),
    meta: {
      title: '会员中心'
    }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/Cart.vue'),
    meta: {
      title: '购物车'
    }
  },
  {
    path: '/goods',
    name: 'goods',
    component: () => import('@/views/Goods.vue'),
    meta: {
      title: '商品详情'
    }
  },
  {
    path: '/demo',
    name: 'demo',
    component: () => import('@/views/Demo.vue'),
    meta: {
      title: 'vant范例'
    }
  }
];

const router = new Router({ routes });

router.beforeEach((to, from, next) => {
  const title = to.meta && to.meta.title;
  if (title) {
    document.title = title;
  }
  next();
});

export default router;
