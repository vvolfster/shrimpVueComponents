<template>
    <div style="margin-top: 20px;">
        <!-- Rounded switch -->
        <input type="checkbox" v-model="useVue" id="useVueToastRadio"/>
        <label class="switch" for="useVueToastRadio">
            Use Vue.toast
        </label>
        <br>
        <button class='btn waves-effect waves-light' v-for="style in toastStyles" :key="style" @click="showToast(style)">
            {{ style }}
        </button>
        <button class='btn' @click="dismissAll">
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
            toastStyles: ['default', 'positive', 'negative', 'info', 'html'],
            useVue: false,
        }
    },
    methods: {
        showToast(name) {
            if(name !== 'html'){
                const msg = 'Hello world. How are you?'
                const fn = this.useVue ? Vue.toast : Toast;
                if(name === 'default')
                    fn(msg)
                else
                    fn[name](msg)
            }
            else {
                const msg = `<b>Hello world</b><br>How are you?`
                const fn = this.useVue ? Vue.toast : Toast;
                fn(msg)
            }
        },
        dismissAll() {
            return this.useVue ? Vue.toast.dismissAll() : Toast.dismissAll();
        }
    }
}
</script>
