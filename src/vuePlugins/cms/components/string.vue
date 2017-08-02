<template>
    <div class="main">
        <div class="main--label main--text">{{ name }}</div>
        <input :class="cssClass.input"
                type="text" v-model:value="userInput" 
                @mouseover='addInputCssClass("hardborder")'  
                @mouseleave='removeInputCssClass("hardborder")'  
        ></input>
    </div>
</template>

<script>
    export default {
        props: {
            name: ``,
            value: ``,
            options: null,
        },
        data() {
            return {
                cssClass: {
                    input: "main--value main--text main--text--border"
                },
                userInput: ``,
            }
        },
        methods: {
            addInputCssClass(className) {
                if(this.cssClass.input.indexOf(className) === -1)
                    this.cssClass.input += ` ${className}`
            },
            removeInputCssClass(className) {
                this.cssClass.input = this.cssClass.input.replace(` ${className}`, ``);
            },
        },
        watch: {
            userInput(val) {
                if(this.userInput !== this.value)
                    this.$emit(`submit`, val);
            },
        },
        mounted() {
            if(this.value)
                this.userInput = this.value;
        }
    }
</script>

<style scoped>
    .main {
        width: 100%;
        height : 100%;
        display: grid;
        grid-template-columns: 5px 16px 1fr 10fr 5px;
        grid-template-areas  : ". icon label value .";
    }

    .main--text {
        font-size: 14pt;  
    }

    .main--label {
        grid-area: label;
        align-self:center;
        overflow: hidden;
        margin: 0 0 0 0.5em;
    }

    .main--value {
        grid-area: value;
        align-self:center;
        height : 95%;
    }

    .validatoricon {
        width : 16px;
        height: 16px;
        align-self:center;
        grid-area: icon;
    }

    .main--value:focus {
        background-color: #eee;
    }

    

    .main--text--border {
        border-color: gray;
        border-style: solid;
        border-width: 0 0 1px 0;
        /*width : 95%;*/
    }

    .hardborder {
        border-color: black;
        border-style: solid;
        border-width: 0 0 1px 0;
        /*width : 95%;*/
    }

</style>
