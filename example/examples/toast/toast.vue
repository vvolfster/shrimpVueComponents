<template>
    <div>
        <!-- Rounded switch -->
        <label class="switch">            
            <input type="checkbox" v-model="useVue">
            <span class>Use Vue.toast</span>
        </label>

        <button v-for="style in toastStyles" :key="style" @click="showToast(style)">
            {{ style }}
        </button>
        <button @click="dismissAll">
             dismissAll
        </button>
    </div>
</template>

<script>
import Vue from 'vue'
import Toast from '@/vuePlugins/toasts'

export default {
    data(){
        return {
            toastStyles: ['default', 'positive', 'negative', 'info'],
            useVue: false,
        }
    },
    methods: {
        showToast(name) {
            const msg = 'Hello world. How are you?'
            const fn = this.useVue ? Vue.toast : Toast;
            if(name === 'default')
                fn(msg)
            else
                fn[name](msg)
        },
        dismissAll() {
            return this.useVue ? Vue.toast.dismissAll() : Toast.dismissAll();
        }
    }
}
</script>

<style scoped>
    button {
        border: solid 1px;
    }
</style>
