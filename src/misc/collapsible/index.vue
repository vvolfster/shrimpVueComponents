<!--
EVENTS: opened, closed
-->
<template>
    <div>
        <div v-if="direction === 'up'">
            <transition
                @enter="enter"
                @leave="leave"
                :css="false"
                ref="content"
            >
                <slot name="content" v-if="d_open"></slot>
            </transition>

            <div class="collapsibleHeader" ref="header"  @click="toggle()">
                <slot name="heading"></slot>
            </div>
        </div>
        <div v-else>
            <div class="collapsibleHeader" ref="header"  @click="toggle()">
                <slot name="heading"></slot>
            </div>
            <transition
                @enter="enter"
                @leave="leave"
                :css="false"
                ref="content"
            >
                <slot name="content" v-if="d_open"></slot>
            </transition>
        </div>
    </div>
</template>

<script>
    import Velocity from 'velocity-animate'

    export default {
        props: {
            open: {
                type: Boolean,
                default: false
            },
            duration: {
                type: Number,
                default: 300
            },
            animated: {
                type: Boolean,
                default: true,
            },
            direction: {
                type: String,
                default: 'down'
            }
        },
        data() {
            return {
                d_open: false,
            }
        },
        mounted() {
            this.d_open = this.open;
        },
        watch: {
            open(v) {
                this.d_open = v;
            },
        },
        methods: {
            toggle() {
                this.d_open = !this.d_open;
            },
            expand() {
                this.d_open = true;
            },
            collapse() {
                this.d_open = false;
            },
            enter(el, done) {
                const self = this;
                function finish(){
                    done();
                    self.$emit(`opened`);
                }
                if(this.animated)
                    Velocity(el, 'slideDown', { duration: this.duration, easing: 'ease-out', complete: finish });
                else
                    finish();
            },
            leave(el, done) {
                const self = this;
                function finish(){
                    done();
                    self.$emit(`closed`);
                }
                if(this.animated)
                    Velocity(el, 'slideUp', { duration: this.duration, easing: 'ease-out', complete: finish });
                else
                    finish();
                // Velocity(el, { translateX: '15px', rotateZ: '50deg' }, { duration: 600 })
                // Velocity(el, { rotateZ: '100deg' }, { loop: 2 })
                // Velocity(el, {
                //     rotateZ: '45deg',
                //     translateY: '30px',
                //     translateX: '30px',
                //     opacity: 0
                // },
                // { complete: done })
            },
            isOpen() {
                return this.d_open
            }
        },
    }
</script>

<style scoped>
    .collapsibleHeader {
        cursor: pointer;
    }
</style>
