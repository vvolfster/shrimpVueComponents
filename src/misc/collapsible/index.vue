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
                <slot name="content" v-if="isOpen"></slot>
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
                <slot name="content" v-if="isOpen"></slot>
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
                isOpen: false,
            }
        },
        mounted() {
            this.isOpen = this.open;
        },
        watch: {
            open(v) {
                this.isOpen = v;
            },
        },
        methods: {
            toggle() {
                this.isOpen = !this.isOpen;
            },
            expand() {
                this.isOpen = true;
            },
            collapse() {
                this.isOpen = false;
            },
            enter(el, done) {
                const self = this;
                function finish(){
                    done();
                    self.$emit(`opened`);
                }
                if(this.animated)
                    Velocity(el, 'slideDown');
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
        },
    }
</script>

<style scoped>
    .collapsibleHeader {
        cursor: pointer;
    }
</style>
