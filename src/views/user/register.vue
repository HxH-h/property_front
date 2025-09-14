<template>
        <el-container style="align-items: center;
                      justify-content: center;
                      ">
            <el-header style="height: 20vh;"></el-header>
            <el-card style="max-width: 360px; text-align: center;">

                <el-form ref="ruleFormRef"  :model="ruleForm" status-icon :rules="rules"
                    label-width="auto" class="demo-ruleForm">
                    <el-form-item prop="role" style="margin-left: 5vw">
                      <div class="flex gap-2 mt-4">
                        <el-check-tag :checked="tenant" type="warning" @change="onChange(true)">
                          我是租客
                        </el-check-tag>
                        <el-check-tag :checked="lord" type="success" @change="onChange(false)">
                          我是房东
                        </el-check-tag>

                      </div>
                    </el-form-item>
                    <el-form-item label="昵称" prop="username">
                        <el-input v-model="ruleForm.username" type="text" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="ruleForm.email" type="text" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="ruleForm.password" type="password" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="checkPass">
                        <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="图形验证码" prop="captcha">
                        <el-input v-model="ruleForm.captcha" type="text" autocomplete="off">
                            <template #append>
                                <img :src="imgBase64" @click="getCaptcha" style="width: 100%; height: 100%;" />
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="邮箱验证码" prop="code">
                        <el-input v-model="ruleForm.code" type="text" autocomplete="off">
                            <template #append>
                                <el-button @click="getCode"
                                    :disabled="ruleForm.email != '' && ruleForm.captcha != '' ? false : true">获取验证码</el-button>
                            </template>
                        </el-input>
                    </el-form-item>


                </el-form>
                <template #footer>
                    <el-button type="primary" @click="submitForm(ruleFormRef)">
                        注册
                    </el-button>
                </template>
            </el-card>
        </el-container>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { get, post } from '../../ts/request'
import {SUCCESS} from "@/ts/code";
import { ElMessage } from 'element-plus'
import { REGISTER_URL , CODE_URL , CAPTCHA_URL } from '@/ts/url';

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])
// 在注册成功或需要关闭时调用此方法
const closeDialog = () => {
  emit('update:visible', false)
}

const ruleFormRef = ref<FormInstance>()
const imgBase64 = ref('')
const tenant = ref(true)
const lord = ref(false)

onMounted(() => {
    getCaptcha()
})
const validateUsername = (rule: any, value: any, callback: any) => {
    // 判断username是否符合正则表达式要求
    const reg = /^[A-Za-z][A-Za-z0-9!#$%^&*]*$/

    if (value === '') {
        callback(new Error('Please input the username'))
    } else if (!reg.test(value)) {
        callback(new Error('The username is invalid'))
    } else if (value.length < 3 || value.length > 100) {
        callback(new Error('The username length is invalid'))
    } else {
        callback()
    }
}
const validateEmail = (rule: any, value: any, callback: any) => {
    // 判断email是否符合正则表达式要求
    const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/

    if (value === '') {
        callback(new Error('Please input the email'))
    } else if (!reg.test(value)) {
        callback(new Error('The email is invalid'))
    } else {
        callback()
    }
}
const validateCode = (rule: any, value: any, callback: any) => {

    if (value === '') {
        callback(new Error('Please input the code'))
    } else if (value.length !== 6) {
        callback(new Error('The code length is invalid'))
    } else {
        callback()
    }
}

const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the password'))
    } else {
        if (ruleForm.checkPass !== '') {
            if (!ruleFormRef.value) return
            ruleFormRef.value.validateField('checkPass').catch((error: any) => {
                // 接收抛出的异常 否则element-plus上层也不会接收，最终报错
             })
        }
        callback()
    }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
    if (value == '') {
        callback(new Error('Please input the password again'))
    } else if (value != ruleForm.password) {
        callback(new Error("Two inputs don't match!"))
    } else {
        callback()
    }
}

const onChange = (role: boolean) => {
    ruleForm.role = role
    if (role){
      lord.value = false
      tenant.value = true
    }else {
      lord.value = true
      tenant.value = false
    }
}

const ruleForm = reactive({
    role: true,
    username: '',
    password: '',
    checkPass: '',
    email: '',
    captcha: '',
    code: ''

})

const rules = reactive<FormRules<typeof ruleForm>>({
    username: [{ validator: validateUsername, trigger: 'blur' }],
    email: [{ validator: validateEmail, trigger: 'blur' }],
    password: [{ validator: validatePass, trigger: 'blur' }],
    checkPass: [{ validator: validatePass2, trigger: 'blur' }],
    captcha: [{ validator: validateCode, trigger: 'blur' }],
    code: [{ validator: validateCode, trigger: 'blur' }]
})

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            post(REGISTER_URL, '', ruleForm)
            console.log('提交成功')
            closeDialog()
        } else {
            console.log('error submit!')

        }
    })
}

async function getCode() {
    let response = await get(CODE_URL, '', ruleForm.email, ruleForm.captcha)
    if (response.code == SUCCESS){
        ElMessage({
            type: 'success',
            message: response.msg
        })
    }else{
        ElMessage({
            type: 'error',
            message: response.msg
        })
    }
}
async function getCaptcha() {
    imgBase64.value = await get(CAPTCHA_URL, '')

}

</script>
<style scoped>

#building {
    width: 100%;
    height: 100%;
    position: fixed;
    background-size: 100% 100%;
}
.demo-ruleForm{
    max-width: 600px;
    background-color: transparent !important;
}
.el-card {
    background-color: transparent;
    border-color: transparent;
    margin-top: -20vh;
}

</style>