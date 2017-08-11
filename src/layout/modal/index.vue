<template>
    <div class="derpy" style="display:none;" @keyup="keyHandler">
        <slot></slot>
    </div>
</template>

<script>
import lodash from 'lodash'
import Velocity from 'velocity-animate'
import shared from '../shared'
import './modal.css'

function animate({ container, modal, position, animation, animationDuration }) {
    const rects = {
        container: container.getBoundingClientRect(),
        modal: modal.getBoundingClientRect()
    }
    const posCenter = {
        y: (rects.container.height - rects.modal.height) / 2,
        x: (rects.container.width - rects.modal.width) / 2
    }

    function point(x, y) {
        const obj = { x: x || 0, y: y || 0 }
        obj.toString = () => {
            return `(${obj.x}, ${obj.y})`
        }
        return obj;
    }

    const positions = {
        up: point(posCenter.x, 0),
        left: point(0, posCenter.y),
        right: point(rects.container.width - rects.modal.width, posCenter.y),
        down: point(posCenter.x, rects.container.height - rects.modal.height),
        center: posCenter
    }

    function setStartingPos() {
        return new Promise((resolve) => {
            const positionAnimDict = {
                down: {
                    up: point(posCenter.x, rects.container.height),
                    down: point(posCenter.x, 0),
                    left: point(-rects.modal.width, rects.container.height - rects.modal.height),
                    right: point(rects.container.width - rects.modal.width, rects.container.height - rects.modal.height)
                },
                left: {
                    up: point(0, rects.container.height),
                    down: point(0, -rects.modal.height),
                    left: point(rects.container.width, posCenter.y),
                    right: point(-rects.modal.width, posCenter.y)
                },
                right: {
                    up: point(rects.container.width - rects.modal.width, rects.container.height),
                    down: point(rects.container.width - rects.modal.width, -rects.modal.height),
                    left: point(rects.container.width, posCenter.y),
                    right: point(0, posCenter.y)
                },
                up: {
                    up: point(posCenter.x, rects.container.height),
                    down: point(posCenter.x, -rects.modal.height),
                    left: point(-rects.modal.width, 0),
                    right: point(rects.container.width - rects.modal.width, 0)
                },
                center: {
                    up: point(posCenter.x, rects.container.height),
                    down: point(posCenter.x, 0),
                    left: point(0, posCenter.y),
                    right: point(rects.container.width, posCenter.y)
                }
            }

            const pos = lodash.get(positionAnimDict, `${position}.${animation}`) || positionAnimDict.center.down;
            modal.style.top = `${pos.y}px`;
            modal.style.left = `${pos.x}px`;
            resolve();
        })
    }

    function setEndingPos() {
        return new Promise((resolve) => {
            const pos = positions[position] || positions.center;
            modal.style.top = `${pos.y}px`;
            modal.style.left = `${pos.x}px`;
            resolve();
        })
    }

    function doAnimation() {
        return new Promise((resolve, reject) => {
            // console.log(`animate ${animation} to position:${position}`)
            const pos = positions[position] || positions.center;
            // console.log(`from ${modal.style.left},${modal.style.top} to ${pos.x},${pos.y}`)
            return Velocity(modal, { top: pos.y, left: pos.x }, { duration: animationDuration }).then(resolve).catch(reject)
        })
    }

    return new Promise((resolve, reject) => {
        if(!animation || animation === 'none')
            return setEndingPos().then(resolve).catch(reject);

        return setStartingPos().then(doAnimation).then(resolve).catch(reject);
    })
}

function create({ slot, slotParent, dismissFn, animation, animationDuration, position }) {
    const slotEl = slot.$el || slot;
    // console.log(`animate ${animation}`)

    function createModalContainer() {
        const frag = document.createDocumentFragment();
        const newNode = document.createElement("div");
        newNode.id = `modalContainer_${shared.modals.newKey}`;
        newNode.className = "modalContainer"

        frag.appendChild(newNode);
        document.body.appendChild(frag);
        return newNode;
    }

    function createModalObject(container) {
        const frag = document.createDocumentFragment();
        const newNode = document.createElement("div");
        newNode.id = `modal_${shared.modals.newKey}`;
        newNode.className = "modalObject"

        // newNode.style[`pointer-events`] = `none`;
        const relativePosNode = document.createElement('div');
        relativePosNode.className = "modalObjectWrapper"

        // put it in the DOM. don't forget to add the slot element
        newNode.appendChild(slotEl);
        relativePosNode.appendChild(newNode);
        frag.appendChild(relativePosNode);
        container.appendChild(frag);
        return newNode;
    }

    function createModalLogic(container, modal) {
        container.isDismissed = false;
        container.dissmissFns = []
        container.onDismiss = (fn) => {
            if(typeof fn === 'function')
                container.dissmissFns.push(fn);
        }
        container.dismiss = () => {
            container.isDismissed = true;
            lodash.each(container.dissmissFns, (fn) => {
                if(typeof fn === 'function')
                    fn();
            })

            slotParent.appendChild(slotEl);

            // delete the modal!
            container.parentNode.removeChild(container);
        }

        container.addEventListener('click', () => {
            if(!container.isDismissed)
                container.dismiss();
        })

        modal.addEventListener('click', (e) => {
            // e.preventDefault();
            e.stopPropagation();
        })
    }

    const container = createModalContainer();
    const modal = createModalObject(container);
    createModalLogic(container, modal);
    container.onDismiss(dismissFn);
    shared.modals.push(container);

    animate({ container, modal, position, animation, animationDuration });

    return container;
}

export default {
    props: {
        containerStyle: {
            type: [Object, String],
            default() {
                return {}
            }
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
        animationDuration: {
            type: Number,
            default: 300
        }
    },
    data(){
        return {
            instance: null
        }
    },
    beforeDestroy() {
        this.close();
    },
    methods: {
        open(config) {
            const self = this;
            const slotParent = this.$el;
            const slot = this.$el.childNodes.length ? this.$el.childNodes[0] : null;

            const animation = lodash.get(config, "animation") || self.animation;
            const animationDuration = lodash.get(config, "animationDuration") || self.animationDuration;
            const position = lodash.get(config, "position") || self.position;

            if(!slot)
                return console.error('no slot provided to the modal to open')

            if(!slotParent)
                return console.error('slot parent is invalid in the modal. This is likey a bug within the modal itself')

            function dismissFn() {
                self.instance = null;
                self.$emit('closed');
            }

            this.instance = create({
                slot,
                slotParent,
                dismissFn,
                animation,
                animationDuration,
                position,
            })

            return this.instance;
        },
        close() {
            if(this.instance)
                this.instance.dismiss();
        },
        keyHandler(e) {
            console.log(`escape mofo`)
            if(e.keyCode === 27)
                this.close();
        }
    }
}
</script>

<style scoped>
</style>
