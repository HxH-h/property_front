import { createStore } from 'vuex'

export default createStore({
  state: {
    uuid: '',
    username: '',
    email: '',
    avatar: '',
    accessToken: '',
    refreshToken: '',
  },
  getters: {
  },
  mutations: {
    setToken(state, token) {
      state.accessToken = token.accessToken
      state.refreshToken = token.refreshToken
      localStorage.setItem("access_token",token.accessToken)
      localStorage.setItem("refresh_token",token.refreshToken)
    },
    setAccessToken(state, accessToken) {
      state.accessToken = accessToken
      localStorage.setItem("access_token",accessToken)
    },
    setUserInfo(state, userInfo) {
      state.uuid = userInfo.uuid
      state.username = userInfo.username
      state.email = userInfo.email
      state.avatar = userInfo.avatar
    },
    setPhoto(state, avatar) {
      state.avatar = avatar
    },
    logout(state){
      state.uuid = ''
      state.username = ''
      state.email = ''
      state.avatar = ''
      state.accessToken = ''
      state.refreshToken = ''
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  },
  actions: {
  },
  modules: {

  }
})
