<template>
    <div class='modalObject column instanceRoot' :style="ui.style" @click.stop="doNothing">
        <div class="dialog__title" :style="styles.title">{{ ui.title }}</div>
        <pre class="dialog__description" :style="styles.description">{{ ui.description }}</pre>
        <autoform v-if="ui.form"
            ref="form"
            :fields="ui.form"
            :labelLayout="ui.labelLayout"
            :fullyReactive="ui.fullyReactive"
            :fieldSort="ui.fieldSort"
            @value="formVal = $event"
            :style="styles.autoform"
        />
        <div class='buttonRow' v-if="!busy" :style="styles.buttonRow">
            <button 
                v-for="(button, name) in buttons" :key="name" 
                @click.stop="pressButton(name)"
                class="svtbtn dialog__btn" 
                :class="pressedButton === name ? 'dialog__btn--clicked' : ''"
            >
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
import fns from '../../misc/functions'
import Toast from '../../vuePlugins/toasts'
import '../../../cssImporter'

export default {
    components: { autoform },
    data() {
        return {
            busy: false,
            progress: 0,
            listenToEnter: true,
            listenToEscape: true,

            pressedButton: null,
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
        const self = this;

        function setFocus() {
            const form = self.$refs.form;
            if(!form || !form.giveFocus()){
                // remove focus from whatever it is in the background that has focus.
                // this method should work in all browsers!
                const i = document.createElement('input');
                document.body.appendChild(i);
                i.focus();
                i.parentNode.removeChild(i);
            }

            return Promise.resolve();
        }

        function setKeyhandlers() {
            const p = lodash.get(self.params, "onEnter");
            const e = lodash.get(self.params, "onEscape");

            self.listenToEnter = typeof p === 'boolean' || typeof p === 'string' ? p : true;
            self.listenToEscape = typeof e === 'boolean' || typeof e === 'string' ? e : true;

            if(self.listenToEnter || self.listenToEscape)
                document.addEventListener('keyup', self.keyHandler, { capture: true });

            return Promise.resolve();
        }

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
            this.$nextTick(() => {
                fn({
                    element: modal,
                    elementParent: container,
                    startingPosition: startingPos[animation],
                    duration: animationDuration
                })
                .then(setFocus)
                .then(setKeyhandlers)
            })
        }
        else {
            this.$nextTick(() => animator.setPositionWithinParent({ element: modal, position }).then(setFocus).then(setKeyhandlers))
        }
    },
    beforeDestroy() {
        document.removeEventListener('keyup', this.keyHandler);
    },
    computed: {
        ui() {
            const params = this.params;
            const title = params && params.title ? params.title : ''
            const description = params && params.description ? params.description : ''
            const style = params && params.style ? params.style : ''
            const form = params && params.form ? params.form : null;
            const labelLayout = params && params.labelLayout ? params.labelLayout : false;
            const fullyReactive = params && typeof params.fullyReactive === 'boolean' ? params.fullyReactive : true;
            const fieldSort = params && params.fieldSort ? params.fieldSort : null;
            return {
                title,
                description,
                style,
                labelLayout,
                fullyReactive,
                fieldSort,
                form
            }
        },
        buttons() {
            const params = this.params;
            return params.buttons || {}
        },
        styles() {
            const params = this.params;
            const styles = params.style || params.styles;

            function isValidStyle(o) {
                return typeof o === 'string' || toString.call(o) === '[object Object]'
            }

            function getStyle(name) {
                if(styles && isValidStyle(styles[name]))
                    return styles[name]

                if(params && isValidStyle(params[`${name}Style`]))
                    return params[`${name}Style`]

                return ''
            }

            return {
                description: getStyle('description'),
                title: getStyle('title'),
                buttonRow: getStyle('buttonRow'),
                autoform: getStyle('autoform')
            }
        },
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
            if(self.pressedButton || self.busy)
                return;

            function animateBtnPress() {
                return new Promise((resolve) => {
                    self.pressedButton = name;
                    setTimeout(resolve, 150);
                })
            }

            function stopAnimation() {
                self.pressedButton = null;
                return Promise.resolve();
            }

            function execute() {
                const buttons = self.buttons;
                const btn = buttons[name];
                const fn = toString.call(btn) === '[object Object]' ? btn.handler : btn;
                const bypassForm = btn.bypassForm || btn.bypass;

                const form = self.$refs.form;
                const formVal = form ? form.getValue() : null;
                const formIsValid = form && !bypassForm ? form.isValid() : true;
                if(typeof fn === 'function'){
                    if(formIsValid){
                        self.busy = true;
                        fns.genericResolver(fn, formVal, (progress) => { self.progress = progress })
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
                        animator.shake({ element: self.$el });
                }
                else {
                    self.close();
                }
            }

            animateBtnPress().then(stopAnimation).then(execute);
        },
        keyHandler(e){
            const self = this;
            function shake() {
                animator.shake({ element: self.$el });
            }

            function getButton(v) {
                const defaultFn = lodash.get(self.params, "noDismiss") ? shake : self.close;
                if(!self.buttons || !lodash.keys(self.buttons).length)
                    return defaultFn;

                if(typeof v === 'string'){
                    const name = lodash.findKey(self.buttons, (btnVal, btnName) => btnName === v);
                    if(name){
                        return () => self.pressButton(name);
                    }
                }
                else { // it's a boolean. The behavior is to find the first button whose value is a function
                    const name = lodash.findKey(self.buttons, btnVal => typeof btnVal === 'function') || lodash.first(lodash.keys(self.buttons));
                    if(name){
                        return () => self.pressButton(name);
                    }
                }

                return defaultFn;
            }

            if(e.keyCode === 13 && self.listenToEnter){
                // const d = new Date();
                // console.log("ENTER HANDLER", lodash.get(self, "params.title") || self.$el.id, d.getHours(), ":", d.getMinutes(), ":", d.getSeconds(), ":", d.getMilliseconds());
                const btnFn = getButton(self.listenToEnter);
                if(e.stopPropagation)
                    e.stopPropagation();
                btnFn();
            }
            else if(e.keyCode === 27 && self.listenToEscape){
                const defaultFn = lodash.get(self.params, "noDismiss") ? shake : self.close;
                const btnFn = typeof self.listenToEscape === 'string' ? getButton(self.listenToEscape) : defaultFn;
                if(e.stopPropagation)
                    e.stopPropagation();
                btnFn();
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
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
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

.dialog__btn:hover {
    background: green;
    color: white;
}

.dialog__btn--clicked {
    background: green;
    color: white;
    -webkit-animation: clickAnim 150ms alternate infinite;
    -moz-animation: clickAnim 150ms alternate infinite;
    animation: clickAnim 150ms alternate infinite;
}


@-moz-keyframes clickAnim {
    0%   { -moz-transform: scale(1.0); }
    100% { -moz-transform: scale(1.1); }
}
@-webkit-keyframes clickAnim {
    0%   { -webkit-transform: scale(1.0); }
    100% { -webkit-transform: scale(1.1); }
}
@keyframes clickAnim {
    0%   { transform: scale(1.0); }
    100% { transform: scale(1.1); }
}


@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }

</style>
