import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useStore } from "vuex"
import { get } from '@/ts/request';
import {SUCCESS} from "@/ts/code";
import {USER_INFO_URL} from "@/ts/url";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/main',
    meta: { isAuth: true },
  },
  {
    path: '/notfound',
    name: 'notfound',
    component: () => import('../views/404.vue')
  },
  {
    path: '/main',
    name: 'main',
    meta: { isAuth: true },
    component: () => import('../views/main.vue'),
    redirect: '/test',
    children: [
      {
        path: '/test',
        name: 'test',
        component: () => import('../views/user/test.vue'),
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/user/login.vue')
  },
  {
    path : '/:pathMatch(.*)*',
    redirect: '/notfound'
  }
  

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const store = useStore()
  const jwt_token = localStorage.getItem("access_token")
  

  //如果路由需要跳转
  if (to.meta.isAuth) {
    if (store.state.accessToken != '') {
      next()  //放行
    } else {
      if (jwt_token) {
        // 获取用户信息  同时可以验证本地存储的token是否过期
        let playerInfo = await get(USER_INFO_URL, jwt_token)
        if (playerInfo.code != SUCCESS) {
          alert('token过期')
          next('/login')
          return
        }
        // 更新用户信息
        store.commit("setUserInfo", playerInfo.data)

        
        // 判断accessToken是否被重置
        // 如果store.accessToken不为空，说明过期被拦截器刷新重置了
        // 如果store.accessToken为空，说明没有被拦截器重置，说明token没有过期 需要给store赋值
        if(store.state.accessToken == ''){
          store.commit('setAccessToken',jwt_token)
        }
        
        next()
      } else {
        alert('请先登录！')
        next('/login')
      }

    }
  } else {
    next()
  }
})


export default router
