<template>
  <div id="APP">
    <router-view> </router-view>
  </div>
</template>

<script lang="ts" setup>
import { checkBrowser, DeviceTYPE, BrowserTYPE } from './ts/utils';
import { ElMessage } from 'element-plus'

const browser = checkBrowser();
if (browser.deviceType != DeviceTYPE.DESKTOP) {
  ElMessage({
    message: 'please use PC to get better experience',
    type: 'warning',
    duration: 0,
    showClose: true,
  })
}else if (browser.browserType != BrowserTYPE.EDGE && browser.browserType != BrowserTYPE.CHROME){
  ElMessage({
    message: 'suggest use Chrome or Edge',
    type: 'warning',
    duration: 0,
    showClose: true,
  })
}

</script>

<style>
body {
  margin: 0px;
  background-size: 100% 100%;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
</style>
