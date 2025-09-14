<template>

    <router-view> </router-view>

</template>
<script setup>

import useWsStore from '@/store/WsSocket';
import {onMounted, onUnmounted, ref, watch} from 'vue';
import router from '@/router';
import { useStore } from "vuex"
import {ElMessage} from "element-plus";


const wsstore = useWsStore();
const store = useStore()



// 页面开启websocket
onMounted(() => {
    console.log('start connection')
    wsstore.createWs()
    console.log('connected')
    watch(() => wsstore.msg, (newValue, oldValue) => {
        const data = JSON.parse(newValue)
        if (data.event == "reconnect"){

        }
    })
})


// 离开页面关闭连接，避免长期占用资源
onUnmounted(() => {
    console.log('close connection')
    wsstore.close()
})





</script>

<style></style>