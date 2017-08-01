<template>
    <div class="combobox">
        <select name="select" v-model="model" class="select">
            <option v-for="option in cOptions" :key="option" :value="option">
                {{ option }}
            </option>
        </select>
        <div class="container">
            <div v-if="!model" class="placeholder">{{ placeholder }}</div>
            <div class="icon">
                <i class="fa fa-caret-down"></i>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            options: {
                type: [Array, null],
                default: null
            },
            placeholder: {
                type: String,
                default: "Select..."
            }
        },
        data() {
            return {
                model: ""
            }
        },
        computed: {
            cOptions() {
                return this.options || [];
            }
        },
        watch: {
            model(v) {
                this.$emit('value', v);
            }
        }
    }
</script>

<style scoped>
    .combobox {
        position:relative;
        width: 200px;
        pointer-events: none;
        color: black;
        font-size: 15pt;
        user-select: none;
        -moz-user-select: none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -o-user-select: none;
    }

    .select {
        width: 100%;
        height: 100%;
        pointer-events: auto;
        cursor: pointer;
        text-align: center;
        overflow: hidden;
        background-color: white;
        color: inherit;
        -webkit-border-radius: 20px;
        -moz-border-radius: 20px;
        border-radius: 20px;
        padding-left: 10px;
        outline:0px;

         -webkit-appearance: none; 
        -moz-appearance: none;
        appearance: none;       /* remove default arrow */
    }

    .select:focus {

    }

    .container {
        height: 100%;
        display: table;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        pointer-events: none;
    }

    .icon {
        vertical-align: middle;
        display: table-cell;
        text-align: right;
        pointer-events: none;
        padding-right: 10px;
    }

    .icon i {
        padding-left: 5px;
        font-size: 20pt;
    }

    .placeholder {
        vertical-align: middle;
        display: table-cell;
        text-align: left;
        pointer-events: none;
        padding-left: 10px;
        color: gray;
    }


</style>
