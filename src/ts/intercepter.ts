import router from '../router'
import axios from 'axios'
import store from '@/store'
import {get} from './request'
import { REFRESH_TOKEN_URL } from './url'
import {NEED_LOGIN , NEED_REFRESH} from "@/ts/code";

const service = axios.create()
service.interceptors.request.use(

);
service.interceptors.response.use(async function (response) {

    if(response.data.code == NEED_LOGIN){
        router.push({name:'login'})
    }else if(response.data.code == NEED_REFRESH){
        // 先从store中获取refreshToken
        var refresh:any = store.state.refreshToken
        if(refresh == '' || !refresh){
            if(localStorage.getItem("refresh_token") != null){
                refresh = localStorage.getItem("refresh_token")
            } 
        }
        // 获取新的accessToken
        var resp = await get(REFRESH_TOKEN_URL , refresh)
        store.commit('setAccessToken',resp.data)
        // 重新发起请求
        response.config.headers.Authorization = resp.data
        return axios.request(response.config)
    }
    return response;
},function error(response){
    return Promise.reject(error)
}

);
export default service

