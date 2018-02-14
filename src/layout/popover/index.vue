<template>
    <div class="popoverRoot">
        <div ref="slotContainer" style="display:none;">
            <slot 
                :tabindex="!focusable ? '-1' : instance !== null ? '0' : '-1'">
            </slot>
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import Popper from 'popper.js'
import shared from '../shared'
import './popover.css'

function createPopper({ slot, slotParent, dismissFn, position, root }) {
    // console.log('createPopper @', position, root)

    const slotEl = slot.$el || slot;
    // console.log(`animate ${animation}`)

    function createObject() {
        const newNode = document.createElement("div");
        newNode.id = `popover_${shared.popovers.newKey}`;

        // newNode.style[`pointer-events`] = `none`;
        const relativePosNode = document.createElement('div');
        relativePosNode.className = "popoverContainer__popoverObjectWrapper"

        // put it in the DOM. don't forget to add the slot element
        newNode.appendChild(slotEl);
        relativePosNode.appendChild(newNode);
        document.body.appendChild(newNode);
        return newNode;
    }

    function createLogic(popover, popperJs) {
        popover.isDismissed = false;
        popover.dissmissFns = []
        popover.onDismiss = (fn) => {
            if(typeof fn === 'function')
                popover.dissmissFns.push(fn);
        }
        popover.dismiss = () => {
            popover.isDismissed = true;
            lodash.each(popover.dissmissFns, (fn) => {
                if(typeof fn === 'function')
                    fn();
            })

            slotParent.appendChild(slotEl);

            // delete the modal!
            popover.parentNode.removeChild(popover);
            popperJs.destroy();
        }

        popover.addEventListener('click', e => e.stopPropagation())
        setTimeout(() => {
            const c = () => {
                if(!popover.isDismissed)
                    popover.dismiss();

                document.removeEventListener('click', c);
            }
            document.addEventListener('click', c)
        }, 50);
    }

    const popoverObject = createObject();
    const placementMap  = {
        bottom: 'bottom',
        bottomRight: 'bottom-end',
        bottomLeft: 'bottom-start',
        top: 'top',
        topRight: 'top-end',
        topLeft: 'top-start',
        right: 'right',
        rightTop: 'right-start',
        rightBottom: 'right-end',
        left: 'left',
        leftTop: 'left-start',
        leftBottom: 'left-end',
        down: 'bottom',
        downRight: 'bottom-end',
        downLeft: 'bottom-start',
        up: 'top',
        upRight: 'top-end',
        upLeft: 'top-start',
        rightUp: 'right-start',
        rightDown: 'right-end',
        leftUp: 'left-start',
        leftDown: 'left-end',
    }

    const popperJs = new Popper(root, popoverObject, {
        placement: placementMap[position] || position || "",
        hide: {
            enabled: true
        }
    });
    createLogic(popoverObject, popperJs);
    popoverObject.onDismiss(dismissFn);

    shared.popovers.push(popoverObject);
    return popoverObject;
}

export default {
    props: {
        position: String,
        noStyle: { type: Boolean, default: true },
        focusable: { type: Boolean, default: true }
    },
    data() {
        return {
            instance: null,
        }
    },
    beforeDestroy() {
        this.close();
    },
    methods: {
        open() {
            const self = this;
            const root = self.$el;
            const slotParent = self.$refs.slotContainer;
            const slot = slotParent.childNodes.length ? slotParent.childNodes[0] : null;
            const position = self.position;
            const isStyled = !self.noStyle

            if(!slot)
                return console.error('no slot provided to the modal to open')

            if(!slotParent)
                return console.error('slot parent is invalid in the modal. This is likey a bug within the modal itself')

            function dismissFn() {
                self.instance = null;
                self.$emit('closed');
                self.$emit('close');
            }

            this.instance = createPopper({
                root,
                slot,
                slotParent,
                dismissFn,
                position,
                isStyled
            })

            self.$emit('opened');
            self.$emit('open');
            if(self.focusable)
                slot.focus();

            return this.instance;
        },
        close() {
            if(this.instance)
                this.instance.dismiss();
        },
        isOpen() {
            return this.instance !== null
        },
        toggle() {
            return this.isOpen() ? this.close() : this.open();
        }
    }
}
</script>

<style scoped>
    .popoverRoot {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        pointer-events: none;
    }
</style>

