// EMITS on,off or stateChange
<template>
    <div :class="ui.bgClass" @click="pushed = !pushed">
        <i :class="ui.iconClass"></i>
        <div class="tbn__text">
            {{ text }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        fa: {
            type: String,
            default: ""
        },
        text: {
            type: String,
            default: ""
        },
        isPushed: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            pushed: false
        }
    },
    mounted() {
        this.pushed = this.isPushed;
    },
    computed: {
        ui() {
            const bgClass = !this.pushed ? `tbtn` : `tbtn tbtn--active`
            let iconClass = !this.pushed ? `tbtn__icon` : `tbtn__icon tbtn__icon--active`;

            if(this.fa) {
                iconClass += ` fa fa-${this.fa}`;
            }

            return {
                bgClass,
                iconClass
            }
        }
    },
    watch: {
        pushed(v) {
            if(v){
                this.$emit(`on`)
            }
            else {
                this.$emit(`off`)
            }
        },
        isPushed(v) {
            this.pushed = v;
        }
    }
}
</script>

<style scoped>
.tbtn {
    cursor: pointer;
    background-color: slateblue;
    border-radius: 15px;
    box-shadow: 0 8px #999;
    -webkit-box-shadow: 0 8px #999;
    -moz-box-shadow: 0 8px #999;
    position: relative;
    bottom: 5px;
    display: table;
}

.tbtn--active {
    background-color: darkslateblue;
    box-shadow: 0 5px #666;
    -webkit-box-shadow: 0 5px #666;
    -moz-box-shadow: 0 5px #666;
    transform: translateY(4px);
}

.tbtn__icon {
    color: white;
    font-size: 1.275rem;
    text-align: center;
    display: table-cell;
    vertical-align: middle;
}

.tbtn__icon--active {
    -ms-transform: rotate(45deg); /* IE 9 */
    -webkit-transform: rotate(45deg); /* Chrome, Safari, Opera */
    transform: rotate(45deg);
}

.tbn__text {
    color: white;
    font-size: 1.275rem;
    text-align: center;
    display: table-cell;
    vertical-align: middle;
}

</style>

