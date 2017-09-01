<template>
    <div class='modalObject column instanceRoot' :style="ui.style" @click.stop="doNothing">
        <div class="dialog__title">{{ ui.title }}</div>
        <div class="dialog__description">{{ ui.description }}</div>
        <autoform v-if="ui.form"
            ref="form"
            :fields="ui.form"
            @value="formVal = $event"
        />
        <div class='buttonRow' v-if="!busy">
            <button v-for="(button, name) in buttons" :key="name" @click="pressButton(name)">
                {{ name }}
            </button>
        </div>
        <div class="busyContainer" v-else>
            <i class='fa fa-circle-o-notch busy'></i>
            <div class="progress" :style="`width:${progress * 100}%`"/>
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import '../modal/modal.css'
import autoform from '../../input/autoform'
import animator from '../../misc/animator'
import Toast from '../../vuePlugins/toasts'

export default {
    components: { autoform },
    data() {
        return {
            busy: false,
            progress: 0,
        }
    },
    props: {
        params: {
            type: [Object, null, undefined],
            default: null,
        },
        position: {
            type: String,
            default: "center",
            validator(v) {
                return ["up", "down", "left", "right", "center", ""].indexOf(v) !== -1;
            }
        },
        animation: {
            type: String,
            default: "up",
            validator(v) {
                return ["up", "down", "left", "right", "none", ""].indexOf(v) !== -1;
            }
        },
        duration: {
            type: Number,
            default: 300
        }
    },
    mounted() {
        // animate fam!
        const position = this.position;
        const animation = this.animation;
        const animationDuration = this.duration;
        const modal = this.$el;
        const container = this.$el.parentNode;

        const fnNames = {
            up: "animateInTop",
            down: "animateInBottom",
            center: "animateInCenter",
            left: "animateInLeft",
            right: "animateInRight"
        }

        const startingPos = {
            up: 'down',
            left: 'right',
            down: 'up',
            right: 'left',
            center: 'center'
        }

        const fn = lodash.get(animator, `${fnNames[position]}`)
        if(typeof fn === 'function' && animation && animation !== 'none') {
            fn({
                element: modal,
                elementParent: container,
                startingPosition: startingPos[animation],
                duration: animationDuration
            });
        }
        else {
            animator.setPositionWithinParent({ element: modal, position });
        }
    },
    computed: {
        ui() {
            const params = this.params;
            const title = params && params.title ? params.title : ''
            const description = params && params.description ? params.description : ''
            const style = params && params.style ? params.style : ''
            const form = params && params.form ? params.form : null
            return {
                title,
                description,
                style,
                form
            }
        },
        buttons() {
            const params = this.params;
            return params.buttons || {}
        }
    },
    methods: {
        close(){
            this.$emit('close')
        },
        isBusy() {
            return this.busy
        },
        pressButton(name) {
            const self = this;
            const buttons = this.buttons;
            const fn = buttons[name];
            const form = this.$refs.form;
            const formVal = form ? form.getValue() : null;
            const formIsValid = form ? form.isValid() : true;
            if(typeof fn === 'function'){
                if(formIsValid){
                    self.busy = true;
                    Promise.resolve(fn(formVal, (progress) => {
                        self.progress = progress;
                    }))
                    .then(() => {
                        self.busy = false;
                        self.close();
                    })
                    .catch((err) => {
                        self.busy = false;
                        self.progress = 0;

                        function displayable(e) {
                            return typeof e === 'string' || typeof e === 'number'
                        }

                        if(err) {
                            if(displayable(err))
                                Toast.negative(err);
                            else if(displayable(err.message))
                                Toast.negative(err.message);
                            else if(displayable(err.msg))
                                Toast.negative(err.msg);
                            else
                                Toast.negative(err) // just show OBJ OBJ i guess.
                        }
                        else {
                            Toast.negative(`Error Occurred: 8125`)
                        }
                    })
                }
                else
                    animator.shake({ element: this.$el });
            }
            else {
                this.close();
            }
        },
        doNothing(){ /* this is just so we absorb the click */ }
    }
}
</script>

<style scoped>
.dialog__title {
    font-size: 24px;
}

.dialog__description {
    margin-top: 20px;
}

.instanceRoot {
    position: relative;
    cursor: auto;
}

.column {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: space-between;
    max-width: 80vw;
    max-height: 80vh;
    min-width: 10vw;
}

.buttonRow {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    width: 100%;
    height: 50px;
}

button:hover {
    background: green;
    color: white;
}

.busyContainer {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    position: relative;
    width: 100%;
}

.busy {
    -webkit-animation:spin 1s linear infinite;
    -moz-animation:spin 1s linear infinite;
    animation:spin 1s linear infinite;
    font-size: 20px;
    line-height: normal;
}

.progress {
    overflow: hidden;
    height: 2px;
    background: green;
    position: absolute;
    bottom: 1px;
    left: 0;
}

@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

</style>
