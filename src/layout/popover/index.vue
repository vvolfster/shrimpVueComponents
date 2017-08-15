<template>
    <div class="popoverRoot">
        <div ref="slotContainer" style="display:none;">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import lodash from 'lodash'
import shared from '../shared'
import './popover.css'

function create({ slot, slotParent, root, dismissFn, position }) {
    const slotEl = slot.$el || slot;
    // console.log(`animate ${animation}`)

    function createContainer() {
        const frag = document.createDocumentFragment();
        const newNode = document.createElement("div");
        newNode.id = `popoverContainer_${shared.popovers.newKey}`;
        newNode.className = "popoverContainer"

        frag.appendChild(newNode);
        document.body.appendChild(frag);
        return newNode;
    }

    function createObject(container) {
        const frag = document.createDocumentFragment();
        const newNode = document.createElement("div");
        newNode.id = `popover_${shared.popovers.newKey}`;
        newNode.className = "popoverObject"

        // newNode.style[`pointer-events`] = `none`;
        const relativePosNode = document.createElement('div');
        relativePosNode.className = "popoverObjectWrapper"

        // put it in the DOM. don't forget to add the slot element
        newNode.appendChild(slotEl);
        relativePosNode.appendChild(newNode);
        frag.appendChild(relativePosNode);
        container.appendChild(frag);
        return newNode;
    }

    function createLogic(container, popover) {
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

        popover.addEventListener('click', (e) => {
            // e.preventDefault();
            e.stopPropagation();
        })
    }

    const container = createContainer();
    const popover = createObject(container);
    createLogic(container, popover);
    container.onDismiss(dismissFn);
    shared.popovers.push(container);

    const rootRect = root.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();

    // figure out if we need to resize the combobox
    if(position === 'top') {
        const diff = (rootRect.top - popoverRect.height);
        if(diff < 0) {
            popover.style.height = `${rootRect.top}px`;
            popover.style.top = `${rootRect.top - popover.style.height}px`;
        }
        else {
            popover.style.top = `${rootRect.top - popoverRect.height}px`;
        }
    }
    else {
        const diff = (rootRect.bottom + popoverRect.height) - bodyRect.bottom
        if(diff > 0)
            popover.style.height = `${bodyRect.bottom - rootRect.bottom}px`;

        popover.style.top = `${rootRect.bottom}px`;
    }

    popover.style.left = `${rootRect.left}px`;
    return container;
}

export default {
    props: {
        position: String
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

            if(!slot)
                return console.error('no slot provided to the modal to open')

            if(!slotParent)
                return console.error('slot parent is invalid in the modal. This is likey a bug within the modal itself')

            function dismissFn() {
                self.instance = null;
                self.$emit('closed');
            }

            this.instance = create({
                root,
                slot,
                slotParent,
                dismissFn,
                position
            })

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

