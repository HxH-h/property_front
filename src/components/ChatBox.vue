<!-- src/components/ChatBox.vue -->
<template>
  <div class="chat-box" :style="{ width: width, height: height }">
    <!-- 消息显示区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <div
          v-for="message in messages"
          :key="message.id"
          :class="['message-item', message.sender === SenderType.Me ? 'my-message' : 'other-message']"
      >
        <el-avatar
            v-if="message.sender !== SenderType.Me"
            :size="avatarSize"
            :src="message.avatar"
            class="avatar"
        />
        <div class="message-content">
          <div class="sender-name" v-if="message.sender !== SenderType.Me">
            {{ message.name }}
          </div>
          <div class="message-bubble">
            <!-- 纯文本消息 -->
            <div v-if="message.type === MessageType.TEXT" class="message-text">
              {{ message.content }}
            </div>

            <!-- 文本+按钮消息 -->
            <div v-else class="message-with-buttons">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-buttons">
                <el-button
                    v-for="(button, index) in message.buttons"
                    :key="index"
                    :type="button.type || 'primary'"
                    size="small"
                    @click="() => onEvent && onEvent('buttonClick', { message, button })"
                >
                  {{ button.text }}
                </el-button>
              </div>
            </div>

            <div class="message-meta">
              <span class="message-time">{{ message.time }}</span>
              <span
                  v-if="message.sender === SenderType.Other && message.status"
                  :class="['message-status', message.status === MessageStatus.Read ? 'read' : 'unread']"
              >
                {{ message.status === MessageStatus.Read ? '已读' : '未读' }}
              </span>
            </div>
          </div>
        </div>
        <el-avatar
            v-if="message.sender === SenderType.Me"
            :size="avatarSize"
            :src="store.state.avatar"
            class="avatar"
        />
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <el-input
          v-model="inputMessage"
          placeholder="输入消息..."
          @keydown.enter.exact.prevent="handleSend"
          @keydown.enter.shift.exact.prevent="inputMessage += '\n'"
      />
      <el-button
          type="primary"
          @click="handleSend"
          :disabled="!inputMessage.trim()"
          size="small"
      >
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import useWsStore from '@/store/WsSocket';
import { useStore } from "vuex"
import {get} from "@/ts/request";
import {GET_MSG_URL} from "@/ts/url";
import {SUCCESS} from "@/ts/code";
import {ElMessage} from "element-plus";

// 使用 TypeScript 枚举
enum SenderType {
  Me = 0,
  Other = 1
}

enum MessageType {
    TEXT,   // 纯文本
    CONTRACT, // 查看合同
    RENEWAL,  // 续租
    END,  // 退租
    MAINTENANCE  // 维修
}

enum MessageStatus {
  Unread = 0,
  Read = 1
}

// 消息按钮定义
interface MessageButton {
  text: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  action?: string
  data?: any
}

// 消息数据结构
interface Message {
  id: string
  content: string
  sender: SenderType
  type: MessageType
  buttons?: MessageButton[]
  name?: string
  time: string
  status?: MessageStatus
}

// 事件类型定义
type EventType = 'send' | 'buttonClick'

// 事件数据定义
interface EventData {
  message?: Message
  button?: MessageButton
  content?: string
}

// 定义组件属性
interface Props {
  // 组件宽度
  width?: string
  // 组件高度
  height?: string
  // 组件可见性
  visible?: boolean
  // 头像大小
  avatarSize?: number | string
  // 对方
  partner: string
  // 房源id
  houseId: bigint
}

// 消息列表
const messages = ref<Message[]>([])
// 获取websocket
const wsstore = useWsStore();
const store = useStore()

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  visible: false,
  avatarSize: 24
})

// 响应式数据
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// 处理发送消息
const handleSend = () => {
  if (!inputMessage.value.trim()) {
    return
  }

  const datetime = formatTime();

  const message: Message = {
    id: Date.now().toString(),
    content: inputMessage.value,
    sender: SenderType.Me,
    type: MessageType.TEXT,
    name: store.state.username,
    time: datetime,
    status: MessageStatus.Unread
  }

  messages.value.push(message)

  wsstore.sendMsg({
    event: "chat",
    receiver: props.partner,
    houseId: props.houseId,
    content: inputMessage.value,
    type: MessageType.TEXT,
    time: datetime,
    status: MessageStatus.Unread
  })
  inputMessage.value = ''
  scrollToBottom()
}
//供外部调用
const sendMsg = (content: string , type: MessageType = MessageType.TEXT) => {
  if (!content.trim()) {
    return
  }
  const datetime = formatTime();

  const message: Message = {
    id: Date.now().toString(),
    content: content,
    sender: SenderType.Me,
    type: type,
    name: store.state.username,
    time: datetime,
    status: MessageStatus.Unread
  }
  messages.value.push(message)

  wsstore.sendMsg({
    event: "chat",
    receiver: props.partner,
    houseId: props.houseId,
    content: content,
    type: type,
    time: datetime,
    status: MessageStatus.Unread
  })

  scrollToBottom()
}

// 格式化时间
const formatTime = () => {
  // 获取当前时间
  const now = new Date();
  // 获取年月日时分秒
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // 拼接为 yyyy-MM-dd HH:mm:ss 格式
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化
watch(() => wsstore.msg, (newValue, oldValue) => {

  const data = JSON.parse(newValue)
  if (data.event == "chat"){
    const message: Message = {
      id: Date.now().toString(),
      content: data.chat.content,
      sender: data.chat.sender == store.state.uuid ? SenderType.Me : SenderType.Other,
      type: data.chat.type,
      name: store.state.username,
      time: data.chat.time,
      status: data.chat.status == 1 ? MessageStatus.Read : MessageStatus.Unread
    }
    messages.value.push(message)
  }

  scrollToBottom()
}, { deep: true })

const getMessage = async () => {
  let response = await get(GET_MSG_URL, store.state.accessToken, props.partner, props.houseId)
  if (response.code != SUCCESS){
    ElMessage({
      type: 'error',
      message: response.msg
    })
    return
  }
  messages.value = response.data.reverse().map((item : Message) => ({
    id: Date.now().toString(),
    content: item.content,
    sender: item.sender == store.state.uuid ? SenderType.Me : SenderType.Other,
    type: item.type,
    name: item.name,
    time: item.time, // 如果有时间字段
    status: item.status // 如果有状态字段
  }));

}


// 组件挂载后滚动到底部
onMounted(() => {
  // 获取历史消息
  getMessage()

  scrollToBottom()
})



// 暴露枚举和方法给父组件
defineExpose({
  SenderType,
  MessageType,
  MessageStatus,
  sendMsg
})
</script>

<style scoped>
.chat-box {
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  min-width: 250px;
  min-height: 200px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #fafafa;
}

.message-item {
  display: flex;
  margin-bottom: 10px;
  align-items: flex-start;
}

.other-message {
  justify-content: flex-start;
}

.my-message {
  justify-content: flex-end;
}

.avatar {
  flex-shrink: 0;
  margin: 0 5px;
}

.message-content {
  max-width: 70%;
}

.sender-name {
  font-size: 10px;
  color: #909399;
  margin-bottom: 2px;
}

.message-bubble {
  position: relative;
  padding: 8px 12px;
  border-radius: 6px;
  word-wrap: break-word;
  font-size: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.other-message .message-bubble {
  background-color: #fff;
  border: 1px solid #ebeef5;
}

.my-message .message-bubble {
  background-color: #409eff;
  color: white;
}

.message-text {
  margin-bottom: 5px;
}

.message-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.message-time {
  font-size: 10px;
  opacity: 0.8;
}

.message-status {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 2px;
}

.message-status.read {
  color: #67c23a;
}

.message-status.unread {
  color: #e6a23c;
  font-weight: bold;
}

.chat-input {
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
  gap: 10px;
}

.chat-input :deep(.el-input) {
  flex: 1;
}

.chat-input :deep(.el-input__inner) {
  height: 32px;
  font-size: 12px;
}

.chat-input :deep(.el-button) {
  height: 32px;
  padding: 8px 12px;
}
</style>
