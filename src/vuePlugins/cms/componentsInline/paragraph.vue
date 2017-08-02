<template>
    <div class="fill">
        <div class="fill" v-if="!show" @click="handleClick($event)"/>
        <div v-else>
            <textarea type="text" class="input fill" id="inlineStringEntry"
                v-model="userInput"  
                :placeholder="name" 
                @keyup="inputHandler"
                @keyup.esc="setVisibility(false)"
                @blur="setVisibility(false)"
            />
        </div>
    </div>
</template>

<script>

function nextTick(fn) {
    setTimeout(fn, 0);
}


export default {
    props: {
        name: ``,
        value: ``,
        options: null,
    },
    data() {
        return {
            show: false,
            userInput: ``,
        }
    },
    methods: {
        setVisibility(v) {
            this.show = v;
            if(v) {
                nextTick(() => document.getElementById("inlineStringEntry").select());
            }
            else if(this.value) {
                this.userInput = this.value;
            }
        },
        inputHandler(e) {
            if(e.keyCode === 13 && !e.shiftKey) {
                // this.userInput = this.userInput.slice(0, -1); // remove the \n at the end
                this.$emit(`submit`, this.userInput);
                this.setVisibility(false)
            }
        },
        handleClick(e) {
            if(e.stopPropagation) e.stopPropagation();
            if(e.preventDefault) e.preventDefault();
            this.setVisibility(true)
        }
    },
    watch: {
        value(v) {
            if(typeof v === `string` || typeof v === `number`){
                this.userInput = v;
            }
        },
        userInput(v) {
            this.$emit('value-changed', v);
        }
    },
    mounted() {
        if(this.value)
            this.userInput = this.value;
    }
}
</script>

<style scoped>
.fill {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    position: absolute;
    color: gray;
}

.input {
    background-color: white;
    resize: none;
    font-size: inherit;
    font-family: inherit;
    padding :0;
    color: black;
}

.input:hover{
    border-style: none; 
}

.input:focus {
    border-style: solid;
    border-color: green;
    border-width:1px;
}

.input::-webkit-scrollbar {
	width: 14px;
    height: 10px;
}

.input::-webkit-scrollbar-thumb {
    height: 6px;
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 7px;
    -webkit-border-radius: 7px;
    background-color: rgba(0, 0, 0, 0.5);
}



</style>
