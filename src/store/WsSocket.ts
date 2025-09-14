import { defineStore } from 'pinia'
import { useStore } from 'vuex';

const url = 'ws://localhost:8081/websocket'

const useWsStore = defineStore('websocket', {

    state: () => ({
        ws: undefined as WebSocket | undefined,
        msg: '',
        // 收到相应到下一次检测的时间差
        heartCheckTime: 4000,
        heartBeat: undefined as any | undefined,
        disConnection: undefined as any | undefined,
        reConnection: undefined as any | undefined,
        // 最大超时时间
        timeout: 50000,
        // 重连次数
        reconCnt: 0,
        // 重连限制
        reconLim: 5,
        // 防止重复重连
        reconLock: false
        }),
    actions: {
        createWs() {
            const store = useStore();
            
            try {
                this.ws = new WebSocket(url + '/' + store.state.accessToken)
                this.initWs()
                
            } catch (error) {
                console.log(error)
                this.reconnect()
            }
        },
        initWs() {
            if (!this.ws) return
            this.ws.onopen = () => {
                console.log('连接成功')
                // 心跳检测
                this.heartCheck()
            }
            this.ws.onmessage = (e) => {
                if (e.data === 'pang') {
                    this.heartCheck()
                    return
                }
                this.msg = e.data
                
                // 心跳检测
                this.heartCheck()
            }
            this.ws.onclose = (event) => {
                console.log('连接关闭 ' + event.code)
                
            }
            this.ws.onerror = (event) => {
                console.log('连接错误')
                
            }
        },
        sendMsg(msg: any) {
            // 判断ws是否存在
            if (!this.ws) return
            // 判断websocket 通道是否处于打开状态
            if (this.ws.readyState === WebSocket.OPEN) {
                // 封装并发送消息
                this.ws.send(JSON.stringify(msg))
            } else {
                console.log('连接未建立')
            }
        },
        heartCheck() {
            console.log('heart check')
            // 清除上一次心跳
            if (this.heartBeat) this.clearTime()
            // 延时心跳
            this.heartBeat = setTimeout(() => {
                this.sendMsg({
                    event: 'ping'
                })
                // 超时断连
                this.disConnection = setTimeout(() => {
                    this.close()
                    this.reconnect()
                }, this.timeout)
            }, this.heartCheckTime)

        },
        reconnect(){
            // 防止重复重连
            if(this.reconLock) return
            // 清除上一次重连定时器
            if(this.reConnection) clearTimeout(this.reConnection)
            // 重连次数限制
            if(this.reconCnt >= this.reconLim) return
            // 开启重连
            console.log("尝试重连")
            this.reconLock = true
            this.reconCnt++
            this.reConnection = setTimeout(() => {
                this.reconLock = false
                this.createWs()
            }, 5000)
        },
        clearTime() {
            if (this.heartBeat) clearTimeout(this.heartBeat)
            if (this.disConnection) clearTimeout(this.disConnection)
        },

        getMsg() {
            return this.msg
        },
        close() {
            if (this.ws) {
                this.clearTime()
                this.ws.close()
                this.ws = undefined
            }
        }
    }
})
export default useWsStore