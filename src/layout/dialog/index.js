/* eslint-disable import/no-webpack-loader-syntax */
// import lodash from 'lodash'
import Vue from 'vue'
import lodash from 'lodash'
import shared from '../shared'
import instance from './instance'
import '../modal/modal.css'

function createContainer() {
    const frag = document.createDocumentFragment();
    const containerNode = document.createElement("div");
    const containerId = `dialogContainer_${shared.dialogs.newKey}`
    const instanceId = `dialogObject_${shared.dialogs.newKey}`

    containerNode.id = containerId;
    containerNode.className = "modalContainer";
    containerNode.innerHTML = `<instance id="${instanceId}" :params="params" @close="dismiss" ref="instance"/>`
    containerNode.style.display = "flex";
    containerNode.style.alignItems = "center";
    containerNode.style.justifyContent = "center";
    frag.appendChild(containerNode);
    document.body.appendChild(frag);
    return {
        container: containerNode,
        instanceId,
        containerId
    }
}

function create(params) {
    const retObj = createContainer();
    const onDismiss = params.onDismiss;
    const container = retObj.container;
    const busyCanBeDismissed = params.dismissBusy;
    container.style.cursor = params.noDismiss ? 'not-allowed' : 'pointer';

    const instanceId = retObj.instanceId;
    const dialog = new Vue({
        el: `#${instanceId}`,
        methods: {
            dismiss() {
                if(this.isBusy() && !busyCanBeDismissed)
                    return;

                this.isDismissed = true;
                lodash.each(this.dismissFns, (fn) => {
                    if(typeof fn === 'function')
                        fn();
                })

                if(typeof onDismiss === 'function')
                    onDismiss();

                this.$destroy();
            },
            isBusy() {
                if(this.$refs && this.$refs.instance)
                    return this.$refs.instance.isBusy();
                return false;
            },
            onDismiss(fn) {
                if(typeof fn === 'function')
                    this.dismissFns.push(fn);
            }
        },
        destroyed() {
            container.parentNode.removeChild(container);
        },
        data() {
            return {
                params,
                isDismissed: false,
                dismissFns: [],
            }
        },
        components: { instance }
    })

    shared.dialogs.push(dialog);

    if(!params.noDismiss)
        container.addEventListener('click', dialog.dismiss);
}

export default {
    create,
    dismissAll: shared.dialogs.dismissAll
};
