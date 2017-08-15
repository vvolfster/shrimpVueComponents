<template>
    <div style="display:none;" @keyup="keyHandler">
        <slot></slot>
    </div>
</template>

<script>
import lodash from 'lodash'
import animator from "@/misc/animator"
import shared from '../shared'
import './modal.css'

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
